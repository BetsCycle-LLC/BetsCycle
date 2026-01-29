import cors from 'cors';
import express from 'express';

import { env } from './config/env';
import { authRouter } from './routes/auth';
import { adminAuthRouter } from './routes/admin-auth';
import { adminPlayersRouter } from './routes/admin-players';
import { adminCurrenciesRouter } from './routes/admin-currencies';
import { currenciesRouter } from './routes/currencies';

export function createApp() {
  const app = express();

  const allowedOrigins = env.clientOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/admin/auth', adminAuthRouter);
  app.use('/api/admin/players', adminPlayersRouter);
  app.use('/api/admin/currencies', adminCurrenciesRouter);
  app.use('/api/currencies', currenciesRouter);

  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.path} not found` });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Unexpected server error' });
  });

  return app;
}

