// Authentication middleware
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const User = require('../models/user.model');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return ApiResponse.error(res, 'Not authorized to access this route', 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check if user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      // Add user to request object
      req.userId = user._id;
      req.userRole = user.role;
      next();
    } catch (error) {
      logger.error(`Token verification error: ${error.message}`);
      return ApiResponse.error(res, 'Not authorized to access this route', 401);
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return ApiResponse.error(res, 'Server error', 500);
  }
};

/**
 * Check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'Admin') {
    return ApiResponse.error(res, 'Not authorized to access this route. Admin role required.', 403);
  }
  next();
};

/**
 * Check if user is admin or project manager
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.verifyProjectManager = (req, res, next) => {
  if (req.userRole !== 'Admin' && req.userRole !== 'Project Manager') {
    return ApiResponse.error(res, 'Not authorized to access this route. Admin or Project Manager role required.', 403);
  }
  next();
};
