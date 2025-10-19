import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ENV } from './env';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || ENV.CORS_ORIGINS.includes('*') || ENV.CORS_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed'), false);
  },
  credentials: true
});

app.register(async (i) => {
  i.register(authRoutes, { prefix: '/auth' });
  i.register(userRoutes, { prefix: '/users' });
});

app.get('/health', async () => ({ ok: true }));

app.listen({ port: ENV.PORT, host: '0.0.0.0' }).then(() => {
  app.log.info(`user-data listening on :${ENV.PORT}`);
});
