import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import env, { isProd } from './config/env.js';
import logger from './utils/logger.js';
import apiRoutes from './routes/index.js';
import { sanitizeBody } from './middleware/sanitize.js';
import { csrfProtection } from './middleware/csrf.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { sitemap, robots } from './controllers/sitemapController.js';

const app = express();
app.set('trust proxy', 1); // behind Nginx

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: isProd ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      frameSrc: ["'self'", 'https://www.google.com', 'https://heyzine.com'],
      connectSrc: ["'self'"],
    },
  } : false,
}));
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrfProtection);                   // double-submit CSRF on mutations
app.use(mongoSanitize());                 // strip $ and . from keys (NoSQL injection)
app.use(hpp());                           // HTTP parameter pollution
app.use(morgan(isProd ? 'combined' : 'dev', { stream: { write: (m) => logger.http?.(m.trim()) ?? logger.debug(m.trim()) } }));

// Sanitize request bodies on state-changing methods (stored-XSS prevention).
app.use((req, res, next) => (['POST', 'PUT', 'PATCH'].includes(req.method) ? sanitizeBody(req, res, next) : next()));

app.use(`/${env.upload.dir}`, express.static(path.join(process.cwd(), env.upload.dir), { maxAge: '7d' }));

app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
// Stricter limit on mutations — instantiated ONCE (not per-request) so the
// window/store actually accumulates.
const mutationLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
app.use('/api', (req, res, next) => (['POST', 'PUT', 'DELETE'].includes(req.method) ? mutationLimiter(req, res, next) : next()));

// SEO: sitemap + robots served at the domain root (not under /api).
app.get('/sitemap.xml', sitemap);
app.get('/robots.txt', robots);

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
