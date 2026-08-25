// Wraps async route handlers so rejected promises reach the errorHandler.
export default (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
