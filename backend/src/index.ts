import { createApp } from './app';
import { connectToDatabase } from './db/connect';
import { env } from './config/env';
import { ensureDefaultAdmin } from './utils/seed-admin';

async function startServer() {
  await connectToDatabase(env.mongoUri);
  await ensureDefaultAdmin();

  const app = createApp();

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});

