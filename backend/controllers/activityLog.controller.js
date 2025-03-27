// Activity Log controller
const activityLogService = require("../services/activityLog.service")
const ApiResponse = require("../utils/apiResponse")
const logger = require("../utils/logger")

class ActivityLogController {
  /**
   * Get activity logs for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProjectActivityLogs(req, res) {
    try {
      const { projectId } = req.params
      const { page, limit } = req.query

      const logs = await activityLogService.getProjectActivityLogs(projectId, { page, limit })

      return ApiResponse.success(res, "Activity logs retrieved successfully", { logs })
    } catch (error) {
      logger.error(`Error getting project activity logs: ${error.message}`)
      return ApiResponse.error(res, "Error retrieving activity logs", 500)
    }
  }

  /**
   * Get activity logs for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserActivityLogs(req, res) {
    try {
      const { userId } = req.params
      const { page, limit } = req.query

      // Check if user is requesting their own logs or is an admin
      if (userId !== req.userId && req.userRole !== "Admin") {
        return ApiResponse.error(res, "Not authorized to access these activity logs", 403)
      }

      const logs = await activityLogService.getUserActivityLogs(userId, { page, limit })

      return ApiResponse.success(res, "Activity logs retrieved successfully", { logs })
    } catch (error) {
      logger.error(`Error getting user activity logs: ${error.message}`)
      return ApiResponse.error(res, "Error retrieving activity logs", 500)
    }
  }

  /**
   * Get activity logs for a specific item (task, board, etc.)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getItemActivityLogs(req, res) {
    try {
      const { itemType, itemId } = req.params
      const { page, limit } = req.query

      const logs = await activityLogService.getItemActivityLogs(itemType, itemId, { page, limit })

      return ApiResponse.success(res, "Activity logs retrieved successfully", { logs })
    } catch (error) {
      logger.error(`Error getting item activity logs: ${error.message}`)
      return ApiResponse.error(res, "Error retrieving activity logs", 500)
    }
  }
}

module.exports = new ActivityLogController()

