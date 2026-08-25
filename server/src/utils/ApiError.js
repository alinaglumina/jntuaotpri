// Thrown anywhere; caught by the central errorHandler and shaped into the
// legacy envelope { success:false, data:null, error }.
export default class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
  static badRequest(m, d)   { return new ApiError(400, m, d); }
  static unauthorized(m = 'Not authenticated') { return new ApiError(401, m); }
  static forbidden(m = 'Not authorized')        { return new ApiError(403, m); }
  static notFound(m = 'Not found')              { return new ApiError(404, m); }
}
