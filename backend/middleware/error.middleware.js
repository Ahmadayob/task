// Error handling middleware
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * 404 Not Found middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.notFound = (req, res, next) => {
  logger.error(`Not Found: ${req.originalUrl}`);
  return ApiResponse.error(res, `Not Found: ${req.originalUrl}`, 404);
};

/**
 * Error handler middleware
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  
  // Check for Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return ApiResponse.error(res, messages.join(', '), 400);
  }
  
  // Check for Mongoose duplicate key error
  if (err.code === 11000) {
    return ApiResponse.error(res, 'Duplicate field value entered', 400);
  }
  
  // Check for Mongoose cast error
  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Resource not found with id of ${err.value}`, 404);
  }
  
  // Server error
  return ApiResponse.error(res, err.message || 'Server Error', err.statusCode || 500);
};
