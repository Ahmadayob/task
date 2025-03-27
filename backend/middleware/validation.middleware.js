// Validation middleware
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Validate request data against schema
 * @param {Object} schema - Joi schema
 * @returns {Function} - Express middleware
 */
exports.validate = (schema) => (req, res, next) => {
  try {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      logger.error(`Validation error: ${errorMessages.join(', ')}`);
      return ApiResponse.error(res, `Validation error: ${errorMessages.join(', ')}`, 400);
    }
    
    next();
  } catch (error) {
    logger.error(`Validation middleware error: ${error.message}`);
    return ApiResponse.error(res, 'Server error', 500);
  }
};
