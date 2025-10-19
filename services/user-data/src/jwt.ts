import jwt from 'jsonwebtoken';
import { ENV } from './env';

export type JwtAccess = { sub: string; typ: 'access' };
export type JwtRefresh = { sub: string; typ: 'refresh'; sid: string }; // session id

export function signAccess(sub: string) {
  return jwt.sign({ sub, typ: 'access' } satisfies JwtAccess, ENV.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}
export function signRefresh(sub: string, sid: string) {
  return jwt.sign({ sub, typ: 'refresh', sid } satisfies JwtRefresh, ENV.JWT_REFRESH_SECRET, { expiresIn: '30d' });
}
export function verifyAccess(token: string): JwtAccess {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as JwtAccess;
}
export function verifyRefresh(token: string): JwtRefresh {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as JwtRefresh;
}
