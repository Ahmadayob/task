// API response utility
class ApiResponse {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {Object} data - Response data
   * @param {number} statusCode - HTTP status code
   * @returns {Object} - Response object
   */
  static success(res, message = 'Success', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} - Response object
   */
  static error(res, message = 'Error', statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

module.exports = ApiResponse;
