import app from './app.js';
import env, { validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

async function start() {
  validateEnv();          // fail fast on insecure production config
  await connectDB();
  const server = app.listen(env.port, () => logger.info(`API listening on :${env.port} (${env.nodeEnv})`));
  const shutdown = (sig) => { logger.info(`${sig} received, shutting down`); server.close(() => process.exit(0)); };
  ['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => shutdown(s)));
}
start();
