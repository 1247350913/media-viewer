-- password_hash is placeholder; store real hash in practice
INSERT INTO users (email, password_hash, display_name)
VALUES ('dev@example.com', '$2b$10$PLACEHOLDERHASH', 'Dev User')
ON CONFLICT (email) DO NOTHING;

-- create one session expiring in 30 days
INSERT INTO sessions (user_id, refresh_token, expires_at, user_agent, ip_address)
SELECT id, 'dev-refresh-token', NOW() + INTERVAL '30 days', 'local-seed', '127.0.0.1'
FROM users WHERE email='dev@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO profiles (user_id, avatar_url, settings)
SELECT id, NULL, '{"theme":"dark","lang":"en"}'::jsonb
FROM users WHERE email='dev@example.com'
ON CONFLICT (user_id) DO NOTHING;
