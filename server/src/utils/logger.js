import winston from 'winston';
import env, { isProd } from '../config/env.js';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => `${timestamp} ${level}: ${stack || message}`)
);

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd ? combine(timestamp(), errors({ stack: true }), json()) : devFormat,
  transports: [new winston.transports.Console()],
});

if (isProd) {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}
export default logger;
