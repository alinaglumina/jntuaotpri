import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// Collects express-validator results and returns a 400 with the first message.
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  throw ApiError.badRequest(errors.array()[0].msg);
}
