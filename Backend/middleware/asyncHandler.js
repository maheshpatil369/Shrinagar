// Backend/middleware/asyncHandler.js

// This utility function wraps async route handlers to catch any errors
// and pass them to the Express error handling middleware, avoiding the
// need for repetitive try-catch blocks in every controller.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
