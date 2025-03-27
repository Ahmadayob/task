// Activity Log service
const ActivityLog = require("../models/activityLog.model")
const Project = require("../models/project.model")
const Board = require("../models/board.model")
const Task = require("../models/task.model")
const logger = require("../utils/logger")

class ActivityLogService {
  /**
   * Create a new activity log
   * @param {Object} logData - Activity log data
   * @returns {Object} - Created activity log
   */
  async createActivityLog(logData) {
    try {
      const activityLog = new ActivityLog(logData)
      await activityLog.save()
      return activityLog
    } catch (error) {
      logger.error(`Error creating activity log: ${error.message}`)
      throw error
    }
  }

  /**
   * Get activity logs for a project
   * @param {string} projectId - Project ID
   * @param {Object} options - Pagination options
   * @returns {Object} - Activity logs with pagination info
   */
  async getProjectActivityLogs(projectId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options
      const skip = (page - 1) * limit

      // Get all items related to the project
      const project = await Project.findById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get boards in the project
      const boards = await Board.find({ project: projectId })
      const boardIds = boards.map((board) => board._id)

      // Get tasks in the boards
      const tasks = await Task.find({ board: { $in: boardIds } })
      const taskIds = tasks.map((task) => task._id)

      // Query for logs related to the project, its boards, or its tasks
      const query = {
        $or: [
          { "relatedItem.itemId": projectId, "relatedItem.itemType": "Project" },
          { "relatedItem.itemId": { $in: boardIds }, "relatedItem.itemType": "Board" },
          { "relatedItem.itemId": { $in: taskIds }, "relatedItem.itemType": "Task" },
        ],
      }

      const total = await ActivityLog.countDocuments(query)
      const logs = await ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit))
        .populate("user", "name email profilePicture")

      return {
        logs,
        pagination: {
          total,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error(`Error getting project activity logs: ${error.message}`)
      throw error
    }
  }

  /**
   * Get activity logs for a user
   * @param {string} userId - User ID
   * @param {Object} options - Pagination options
   * @returns {Object} - Activity logs with pagination info
   */
  async getUserActivityLogs(userId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options
      const skip = (page - 1) * limit

      const query = { user: userId }

      const total = await ActivityLog.countDocuments(query)
      const logs = await ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit))
        .populate("user", "name email profilePicture")

      return {
        logs,
        pagination: {
          total,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error(`Error getting user activity logs: ${error.message}`)
      throw error
    }
  }

  /**
   * Get activity logs for a specific item
   * @param {string} itemType - Type of item (Project, Board, Task, etc.)
   * @param {string} itemId - Item ID
   * @param {Object} options - Pagination options
   * @returns {Object} - Activity logs with pagination info
   */
  async getItemActivityLogs(itemType, itemId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options
      const skip = (page - 1) * limit

      const query = {
        "relatedItem.itemType": itemType,
        "relatedItem.itemId": itemId,
      }

      const total = await ActivityLog.countDocuments(query)
      const logs = await ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit))
        .populate("user", "name email profilePicture")

      return {
        logs,
        pagination: {
          total,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error(`Error getting item activity logs: ${error.message}`)
      throw error
    }
  }
}

module.exports = new ActivityLogService()

