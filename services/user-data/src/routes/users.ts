import type { FastifyInstance } from 'fastify';
import { verifyAccess } from '../jwt';
import { query } from '../db';

function authGuard(req: any, reply: any, done: any) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return reply.code(401).send({ error: 'missing bearer' });
  const token = h.slice(7);
  try {
    const p = verifyAccess(token);
    (req as any).userId = p.sub;
    done();
  } catch {
    reply.code(401).send({ error: 'invalid token' });
  }
}

export async function userRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: authGuard }, async (req, reply) => {
    const uid = (req as any).userId as string;
    const { rows } = await query<{ id: string; email: string; display_name: string | null }>(
      'SELECT id, email, display_name FROM users WHERE id=$1', [uid]
    );
    if (!rows.length) return reply.code(404).send({ error: 'not found' });
    return reply.send({ user: { id: rows[0].id, email: rows[0].email, displayName: rows[0].display_name } });
  });
}
