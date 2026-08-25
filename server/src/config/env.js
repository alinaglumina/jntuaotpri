import dotenv from 'dotenv';
dotenv.config();

const env = {
  nodeEnv:      process.env.NODE_ENV || 'development',
  port:         parseInt(process.env.PORT || '5000', 10),
  siteUrl: process.env.SITE_URL || process.env.CLIENT_ORIGIN || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri:     process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jntuaweb',
  jwt: {
    secret:    process.env.JWT_SECRET || 'insecure-dev-secret',
    // Access token is now SHORT-lived; refresh token carries the long session.
    expiresIn: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET || 'insecure-dev-secret') + '-refresh',
    refreshExpiresIn: process.env.REFRESH_TOKEN_TTL || '7d',
    refreshTtlMs: parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10) * 24 * 60 * 60 * 1000,
    cookieName: process.env.COOKIE_NAME || 'jntua_token',
    refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'jntua_rt',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    resetTtlMin: parseInt(process.env.RESET_TOKEN_MINUTES || '60', 10),
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxBytes: parseInt(process.env.MAX_UPLOAD_MB || '100', 10) * 1024 * 1024,
    assetBase: process.env.PUBLIC_ASSET_BASE || '',
  },
  mail: {
    host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER, pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'JNTUA Web <no-reply@jntua.ac.in>',
  },
  seed: {
    user:  process.env.SEED_ADMIN_USER  || 'admin',
    pass:  process.env.SEED_ADMIN_PASS  || 'Admin@123',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@jntua.ac.in',
  },
};
export const isProd = env.nodeEnv === 'production';
export default env;

// Fail-fast validation of critical secrets. Called at server startup.
export function validateEnv() {
  const problems = [];
  if (isProd) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) problems.push('JWT_SECRET must be set (>=32 chars) in production');
    if (!process.env.REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN_SECRET.length < 32) problems.push('REFRESH_TOKEN_SECRET must be set (>=32 chars) in production');
    if (process.env.JWT_SECRET && process.env.JWT_SECRET === process.env.REFRESH_TOKEN_SECRET) problems.push('JWT_SECRET and REFRESH_TOKEN_SECRET must differ');
    if (process.env.COOKIE_SECURE !== 'true') problems.push('COOKIE_SECURE must be "true" in production (HTTPS)');
    if (!process.env.CLIENT_ORIGIN) problems.push('CLIENT_ORIGIN must be set in production (CORS)');
  }
  if (problems.length) {
    // eslint-disable-next-line no-console
    console.error('\n[env] Refusing to start — insecure configuration:\n  - ' + problems.join('\n  - ') + '\n');
    process.exit(1);
  }
}
