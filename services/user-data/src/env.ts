import 'dotenv/config';

function req(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}
export const ENV = {
  PORT: Number(process.env.PORT ?? 4001),
  DATABASE_URL: req('DATABASE_URL'),
  JWT_ACCESS_SECRET: req('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: req('JWT_REFRESH_SECRET'),
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? '*')
    .split(',')
    .map(s => s.trim())
};
