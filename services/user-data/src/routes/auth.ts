import type { FastifyInstance } from 'fastify';
import { query } from '../db';
import bcrypt from 'bcryptjs';
import { signAccess, signRefresh, verifyRefresh } from '../jwt';

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post('/register', async (req, reply) => {
    const { email, password, displayName } = (req.body as any) ?? {};
    if (!email || !password) return reply.code(400).send({ error: 'email & password required' });

    const { rows: existing } = await query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.length) return reply.code(409).send({ error: 'email exists' });

    const hash = await bcrypt.hash(password, 10);
    const { rows: created } = await query<{ id: string }>(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1,$2,$3) RETURNING id`,
      [email, hash, displayName ?? null]
    );

    // create session (refresh)
    const { rows: sess } = await query<{ id: string }>(
      `INSERT INTO sessions (user_id, refresh_token, expires_at, user_agent, ip_address)
       VALUES ($1, 'placeholder', NOW() + INTERVAL '30 days', 'api', '0.0.0.0') RETURNING id`,
      [created[0].id]
    );

    const accessToken = signAccess(created[0].id);
    const refreshToken = signRefresh(created[0].id, sess[0].id);
    await query(`UPDATE sessions SET refresh_token = $1 WHERE id = $2`, [refreshToken, sess[0].id]);

    return reply.send({ user: { id: created[0].id, email, displayName: displayName ?? null }, accessToken, refreshToken });
  });

  // Login
  app.post('/login', async (req, reply) => {
    const { email, password } = (req.body as any) ?? {};
    if (!email || !password) return reply.code(400).send({ error: 'email & password required' });

    const { rows } = await query<{ id: string; password_hash: string; display_name: string | null }>(
      'SELECT id, password_hash, display_name FROM users WHERE email=$1', [email]
    );
    if (!rows.length) return reply.code(401).send({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return reply.code(401).send({ error: 'invalid credentials' });

    const { rows: sess } = await query<{ id: string }>(
      `INSERT INTO sessions (user_id, refresh_token, expires_at, user_agent, ip_address)
       VALUES ($1,'placeholder', NOW() + INTERVAL '30 days', 'api', '0.0.0.0')
       RETURNING id`,
      [rows[0].id]
    );
    const accessToken = signAccess(rows[0].id);
    const refreshToken = signRefresh(rows[0].id, sess[0].id);
    await query(`UPDATE sessions SET refresh_token=$1 WHERE id=$2`, [refreshToken, sess[0].id]);

    return reply.send({ user: { id: rows[0].id, email, displayName: rows[0].display_name }, accessToken, refreshToken });
  });

  // Refresh
  app.post('/refresh', async (req, reply) => {
    const { refreshToken } = (req.body as any) ?? {};
    if (!refreshToken) return reply.code(400).send({ error: 'missing refreshToken' });

    let payload: ReturnType<typeof verifyRefresh>;
    try { payload = verifyRefresh(refreshToken); } catch { return reply.code(401).send({ error: 'invalid refresh' }); }

    // check session record still valid and token matches
    const { rows } = await query<{ id: string }>('SELECT id FROM sessions WHERE id=$1 AND refresh_token=$2 AND revoked_at IS NULL AND expires_at>NOW()', [payload.sid, refreshToken]);
    if (!rows.length) return reply.code(401).send({ error: 'revoked or expired' });

    return reply.send({ accessToken: signAccess(payload.sub) });
  });

  // Logout (revoke session)
  app.post('/logout', async (req, reply) => {
    const { refreshToken } = (req.body as any) ?? {};
    if (!refreshToken) return reply.code(400).send({ error: 'missing refreshToken' });
    try {
      const p = verifyRefresh(refreshToken);
      await query('UPDATE sessions SET revoked_at = NOW() WHERE id=$1', [p.sid]);
    } catch { /* ignore */ }
    return reply.send({ ok: true });
  });
}
