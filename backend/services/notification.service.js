// Notification service
const Notification = require("../models/notification.model")
const logger = require("../utils/logger")

class NotificationService {
  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Object} - Created notification
   */
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData)
      await notification.save()
      return notification
    } catch (error) {
      logger.error(`Error creating notification: ${error.message}`)
      throw error
    }
  }

  /**
   * Get notification by ID
   * @param {string} notificationId - Notification ID
   * @returns {Object} - Notification data
   */
  async getNotificationById(notificationId) {
    try {
      const notification = await Notification.findById(notificationId)

      if (!notification) {
        throw new Error("Notification not found")
      }

      return notification
    } catch (error) {
      logger.error(`Error getting notification by ID: ${error.message}`)
      throw error
    }
  }

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Pagination options
   * @returns {Object} - Notifications with pagination info
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options
      const skip = (page - 1) * limit

      const query = { recipient: userId }

      const total = await Notification.countDocuments(query)
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit))
        .populate("sender", "name email profilePicture")

      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      })

      return {
        notifications,
        unreadCount,
        pagination: {
          total,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error(`Error getting user notifications: ${error.message}`)
      throw error
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Object} - Updated notification
   */
  async markNotificationAsRead(notificationId) {
    try {
      const notification = await Notification.findById(notificationId)

      if (!notification) {
        throw new Error("Notification not found")
      }

      notification.isRead = true
      await notification.save()

      return notification
    } catch (error) {
      logger.error(`Error marking notification as read: ${error.message}`)
      throw error
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {boolean} - Success status
   */
  async markAllNotificationsAsRead(userId) {
    try {
      await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true })

      return true
    } catch (error) {
      logger.error(`Error marking all notifications as read: ${error.message}`)
      throw error
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {boolean} - Success status
   */
  async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findById(notificationId)

      if (!notification) {
        throw new Error("Notification not found")
      }

      await Notification.findByIdAndDelete(notificationId)

      return true
    } catch (error) {
      logger.error(`Error deleting notification: ${error.message}`)
      throw error
    }
  }

  /**
   * Delete all notifications for a user
   * @param {string} userId - User ID
   * @returns {boolean} - Success status
   */
  async deleteAllNotifications(userId) {
    try {
      await Notification.deleteMany({ recipient: userId })

      return true
    } catch (error) {
      logger.error(`Error deleting all notifications: ${error.message}`)
      throw error
    }
  }

  /**
   * Create task assignment notification
   * @param {string} taskId - Task ID
   * @param {string} taskTitle - Task title
   * @param {string} assignerId - User ID of the assigner
   * @param {string} assigneeId - User ID of the assignee
   * @returns {Object} - Created notification
   */
  async createTaskAssignmentNotification(taskId, taskTitle, assignerId, assigneeId) {
    try {
      const notification = await this.createNotification({
        type: "Task Assignment",
        title: "New Task Assignment",
        message: `You have been assigned to the task "${taskTitle}"`,
        sender: assignerId,
        recipient: assigneeId,
        relatedItem: {
          itemId: taskId,
          itemType: "Task",
        },
      })

      return notification
    } catch (error) {
      logger.error(`Error creating task assignment notification: ${error.message}`)
      throw error
    }
  }

  /**
   * Create task update notification
   * @param {string} taskId - Task ID
   * @param {string} taskTitle - Task title
   * @param {string} updaterId - User ID of the updater
   * @param {Array} assigneeIds - Array of assignee user IDs
   * @returns {Array} - Created notifications
   */
  async createTaskUpdateNotification(taskId, taskTitle, updaterId, assigneeIds) {
    try {
      const notifications = []

      for (const assigneeId of assigneeIds) {
        // Don't notify the updater
        if (assigneeId.toString() === updaterId.toString()) continue

        const notification = await this.createNotification({
          type: "Task Update",
          title: "Task Updated",
          message: `Task "${taskTitle}" has been updated`,
          sender: updaterId,
          recipient: assigneeId,
          relatedItem: {
            itemId: taskId,
            itemType: "Task",
          },
        })

        notifications.push(notification)
      }

      return notifications
    } catch (error) {
      logger.error(`Error creating task update notification: ${error.message}`)
      throw error
    }
  }

  /**
   * Create task comment notification
   * @param {string} taskId - Task ID
   * @param {string} taskTitle - Task title
   * @param {string} commenterId - User ID of the commenter
   * @param {Array} assigneeIds - Array of assignee user IDs
   * @returns {Array} - Created notifications
   */
  async createTaskCommentNotification(taskId, taskTitle, commenterId, assigneeIds) {
    try {
      const notifications = []

      for (const assigneeId of assigneeIds) {
        // Don't notify the commenter
        if (assigneeId.toString() === commenterId.toString()) continue

        const notification = await this.createNotification({
          type: "Task Comment",
          title: "New Comment",
          message: `New comment on task "${taskTitle}"`,
          sender: commenterId,
          recipient: assigneeId,
          relatedItem: {
            itemId: taskId,
            itemType: "Task",
          },
        })

        notifications.push(notification)
      }

      return notifications
    } catch (error) {
      logger.error(`Error creating task comment notification: ${error.message}`)
      throw error
    }
  }

  /**
   * Create deadline reminder notification
   * @param {string} taskId - Task ID
   * @param {string} taskTitle - Task title
   * @param {Array} assigneeIds - Array of assignee user IDs
   * @returns {Array} - Created notifications
   */
  async createDeadlineReminderNotification(taskId, taskTitle, assigneeIds) {
    try {
      const notifications = []

      for (const assigneeId of assigneeIds) {
        const notification = await this.createNotification({
          type: "Deadline Reminder",
          title: "Upcoming Deadline",
          message: `Task "${taskTitle}" is due soon`,
          recipient: assigneeId,
          relatedItem: {
            itemId: taskId,
            itemType: "Task",
          },
        })

        notifications.push(notification)
      }

      return notifications
    } catch (error) {
      logger.error(`Error creating deadline reminder notification: ${error.message}`)
      throw error
    }
  }

  /**
   * Create project assignment notification
   * @param {string} projectId - Project ID
   * @param {string} projectTitle - Project title
   * @param {string} assignerId - User ID of the assigner
   * @param {string} assigneeId - User ID of the assignee
   * @returns {Object} - Created notification
   */
  async createProjectAssignmentNotification(projectId, projectTitle, assignerId, assigneeId) {
    try {
      const notification = await this.createNotification({
        recipient: assigneeId,
        sender: assignerId,
        message: `You have been added to the project "${projectTitle}"`,
        relatedItem: {
          itemId: projectId,
          itemType: "Project",
        },
        isRead: false,
      })

      return notification
    } catch (error) {
      logger.error(`Error creating project assignment notification: ${error.message}`)
      throw error
    }
  }

  /**
   * Create board creation notification
   * @param {string} boardId - Board ID
   * @param {string} boardTitle - Board title
   * @param {string} projectId - Project ID
   * @param {string} projectTitle - Project title
   * @param {string} creatorId - User ID of the creator
   * @param {Array} teamMemberIds - Array of team member user IDs
   * @returns {Array} - Created notifications
   */
  async createBoardCreationNotification(boardId, boardTitle, projectId, projectTitle, creatorId, teamMemberIds) {
    try {
      const notifications = []

      for (const memberId of teamMemberIds) {
        // Don't notify the creator
        if (memberId.toString() === creatorId.toString()) continue

        const notification = await this.createNotification({
          recipient: memberId,
          sender: creatorId,
          message: `A new board "${boardTitle}" was created in project "${projectTitle}"`,
          relatedItem: {
            itemId: boardId,
            itemType: "Board",
          },
          isRead: false,
        })

        notifications.push(notification)
      }

      return notifications
    } catch (error) {
      logger.error(`Error creating board creation notification: ${error.message}`)
      throw error
    }
  }

  /**
   * Create team role update notification
   * @param {string} projectId - Project ID
   * @param {string} projectTitle - Project title
   * @param {string} updaterId - User ID of the updater
   * @param {string} userId - User ID of the user whose role was updated
   * @param {string} newRole - New role
   * @returns {Object} - Created notification
   */
  async createTeamRoleUpdateNotification(projectId, projectTitle, updaterId, userId, newRole) {
    try {
      const notification = await this.createNotification({
        recipient: userId,
        sender: updaterId,
        message: `Your role in project "${projectTitle}" has been updated to ${newRole}`,
        relatedItem: {
          itemId: projectId,
          itemType: "Project",
        },
        isRead: false,
      })

      return notification
    } catch (error) {
      logger.error(`Error creating team role update notification: ${error.message}`)
      throw error
    }
  }

  /**
   * Create project update notification
   * @param {string} projectId - Project ID
   * @param {string} projectTitle - Project title
   * @param {string} updaterId - User ID of the updater
   * @param {Array} teamMemberIds - Array of team member user IDs
   * @returns {Array} - Created notifications
   */
  async createProjectUpdateNotification(projectId, projectTitle, updaterId, teamMemberIds) {
    try {
      const notifications = []

      for (const memberId of teamMemberIds) {
        // Don't notify the updater
        if (memberId.toString() === updaterId.toString()) continue

        const notification = await this.createNotification({
          recipient: memberId,
          sender: updaterId,
          message: `Project "${projectTitle}" has been updated`,
          relatedItem: {
            itemId: projectId,
            itemType: "Project",
          },
          isRead: false,
        })

        notifications.push(notification)
      }

      return notifications
    } catch (error) {
      logger.error(`Error creating project update notification: ${error.message}`)
      throw error
    }
  }

  /**
   * Create subtask completion notification
   * @param {string} subtaskId - Subtask ID
   * @param {string} subtaskTitle - Subtask title
   * @param {string} taskId - Task ID
   * @param {string} taskTitle - Task title
   * @param {string} completerId - User ID of the completer
   * @param {Array} assigneeIds - Array of task assignee user IDs
   * @returns {Array} - Created notifications
   */
  async createSubtaskCompletionNotification(subtaskId, subtaskTitle, taskId, taskTitle, completerId, assigneeIds) {
    try {
      const notifications = []

      for (const assigneeId of assigneeIds) {
        // Don't notify the completer
        if (assigneeId.toString() === completerId.toString()) continue

        const notification = await this.createNotification({
          recipient: assigneeId,
          sender: completerId,
          message: `Subtask "${subtaskTitle}" in task "${taskTitle}" has been completed`,
          relatedItem: {
            itemId: subtaskId,
            itemType: "Subtask",
          },
          isRead: false,
        })

        notifications.push(notification)
      }

      return notifications
    } catch (error) {
      logger.error(`Error creating subtask completion notification: ${error.message}`)
      throw error
    }
  }
}

module.exports = new NotificationService()

