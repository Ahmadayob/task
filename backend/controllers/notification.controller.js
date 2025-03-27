// Notification controller
const notificationService = require("../services/notification.service")
const ApiResponse = require("../utils/apiResponse")
const logger = require("../utils/logger")

class NotificationController {
  /**
   * Get notifications for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserNotifications(req, res) {
    try {
      const { page, limit } = req.query

      const notifications = await notificationService.getUserNotifications(req.userId, { page, limit })

      return ApiResponse.success(res, "Notifications retrieved successfully", notifications)
    } catch (error) {
      logger.error(`Error getting user notifications: ${error.message}`)
      return ApiResponse.error(res, "Error retrieving notifications", 500)
    }
  }

  /**
   * Mark notification as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markNotificationAsRead(req, res) {
    try {
      const { id } = req.params

      const notification = await notificationService.getNotificationById(id)

      // Check if notification belongs to the user
      if (notification.recipient.toString() !== req.userId) {
        return ApiResponse.error(res, "Not authorized to update this notification", 403)
      }

      const updatedNotification = await notificationService.markNotificationAsRead(id)

      return ApiResponse.success(res, "Notification marked as read", { notification: updatedNotification })
    } catch (error) {
      logger.error(`Error marking notification as read: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Notification not found" ? "Notification not found" : "Error updating notification",
        error.message === "Notification not found" ? 404 : 500,
      )
    }
  }

  /**
   * Mark all notifications as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markAllNotificationsAsRead(req, res) {
    try {
      await notificationService.markAllNotificationsAsRead(req.userId)

      return ApiResponse.success(res, "All notifications marked as read")
    } catch (error) {
      logger.error(`Error marking all notifications as read: ${error.message}`)
      return ApiResponse.error(res, "Error updating notifications", 500)
    }
  }

  /**
   * Delete notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteNotification(req, res) {
    try {
      const { id } = req.params

      const notification = await notificationService.getNotificationById(id)

      // Check if notification belongs to the user
      if (notification.recipient.toString() !== req.userId) {
        return ApiResponse.error(res, "Not authorized to delete this notification", 403)
      }

      await notificationService.deleteNotification(id)

      return ApiResponse.success(res, "Notification deleted successfully")
    } catch (error) {
      logger.error(`Error deleting notification: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Notification not found" ? "Notification not found" : "Error deleting notification",
        error.message === "Notification not found" ? 404 : 500,
      )
    }
  }

  /**
   * Delete all notifications
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteAllNotifications(req, res) {
    try {
      await notificationService.deleteAllNotifications(req.userId)

      return ApiResponse.success(res, "All notifications deleted successfully")
    } catch (error) {
      logger.error(`Error deleting all notifications: ${error.message}`)
      return ApiResponse.error(res, "Error deleting notifications", 500)
    }
  }
}

module.exports = new NotificationController()

