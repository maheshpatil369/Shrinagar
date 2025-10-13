// Backend/middleware/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Use 'export default' instead of 'module.exports'
export default asyncHandler;
