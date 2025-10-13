// Backend/middleware/errorMiddleware.js

// Handles routes that are not found (404)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the centralized error handler
};

// A centralized error handler for all other errors
const errorHandler = (err, req, res, next) => {
  // Sometimes an error might come with a success status code (200),
  // so we default to 500 (Internal Server Error) if it's not already an error code.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose Bad ObjectId Error
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }
  
  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Combine all validation error messages
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for '${field}'. Please use another value.`;
  }

  res.status(statusCode).json({
    message: message,
    // We only want the stack trace if we are not in production for security reasons
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = { notFound, errorHandler };
