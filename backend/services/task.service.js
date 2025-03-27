// Task service
const Task = require("../models/task.model")
const Board = require("../models/board.model")
const ActivityLog = require("../models/activityLog.model")
const Notification = require("../models/notification.model")
const logger = require("../utils/logger")

class TaskService {
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {string} userId - Creator user ID
   * @returns {Object} - Newly created task
   */
  async createTask(taskData, userId) {
    try {
      // Check if board exists
      const board = await Board.findById(taskData.board)
      if (!board) {
        throw new Error("Board not found")
      }

      // Get the highest order value for existing tasks in this board
      const highestOrderTask = await Task.findOne({ board: taskData.board }).sort({ order: -1 })

      const order = highestOrderTask ? highestOrderTask.order + 1 : 0

      // Create the task
      const task = new Task({
        ...taskData,
        order,
      })

      await task.save()

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Created task",
        details: `Task "${task.title}" was created in board "${board.title}"`,
        relatedItem: {
          itemId: task._id,
          itemType: "Task",
        },
      })

      // Create notifications for assignees
      try {
        if (taskData.assignees && taskData.assignees.length > 0) {
          const notificationPromises = taskData.assignees
            .map(async (assigneeId) => {
              // Don't notify the creator if they're also an assignee
              if (assigneeId.toString() === userId.toString()) return null

              try {
                return await Notification.create({
                  recipient: assigneeId,
                  sender: userId,
                  message: `You have been assigned to task "${task.title}"`,
                  relatedItem: {
                    itemId: task._id,
                    itemType: "Task",
                  },
                  isRead: false,
                })
              } catch (notifError) {
                logger.error(
                  `Error creating task assignment notification for assignee ${assigneeId}: ${notifError.message}`,
                )
                return null
              }
            })
            .filter(Boolean)

          await Promise.all(notificationPromises)
        }
      } catch (notificationError) {
        logger.error(`Error creating task assignment notifications: ${notificationError.message}`)
        // Continue execution even if notification creation fails
      }

      return task
    } catch (error) {
      logger.error(`Error creating task: ${error.message}`)
      throw error
    }
  }

  /**
   * Get all tasks for a board
   * @param {string} boardId - Board ID
   * @returns {Array} - List of tasks
   */
  async getTasksByBoard(boardId) {
    try {
      // Check if board exists
      const board = await Board.findById(boardId)
      if (!board) {
        throw new Error("Board not found")
      }

      // Get all tasks for the board
      const tasks = await Task.find({ board: boardId })
        .populate("assignees", "name email profilePicture")
        .sort({ order: 1 })

      return tasks
    } catch (error) {
      logger.error(`Error getting tasks by board: ${error.message}`)
      throw error
    }
  }

  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @returns {Object} - Task data
   */
  async getTaskById(taskId) {
    try {
      const task = await Task.findById(taskId).populate("assignees", "name email profilePicture")

      if (!task) {
        throw new Error("Task not found")
      }

      return task
    } catch (error) {
      logger.error(`Error getting task by ID: ${error.message}`)
      throw error
    }
  }

  /**
   * Update task
   * @param {string} taskId - Task ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID making the update
   * @returns {Object} - Updated task
   */
  async updateTask(taskId, updateData, userId) {
    try {
      const task = await Task.findById(taskId).populate("assignees", "name email profilePicture")

      if (!task) {
        throw new Error("Task not found")
      }

      // Store old assignees for notification
      const oldAssignees = task.assignees.map((assignee) => assignee._id.toString())

      // Update the task
      const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true, runValidators: true }).populate(
        "assignees",
        "name email profilePicture",
      )

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Updated task",
        details: `Task "${task.title}" was updated`,
        relatedItem: {
          itemId: task._id,
          itemType: "Task",
        },
      })

      // Create notifications for new assignees
      try {
        if (updateData.assignees) {
          const newAssignees = updateData.assignees.filter(
            (assigneeId) => !oldAssignees.includes(assigneeId.toString()),
          )

          const notificationPromises = newAssignees
            .map(async (assigneeId) => {
              // Don't notify the updater if they're also a new assignee
              if (assigneeId.toString() === userId.toString()) return null

              try {
                return await Notification.create({
                  recipient: assigneeId,
                  sender: userId,
                  message: `You have been assigned to task "${task.title}"`,
                  relatedItem: {
                    itemId: task._id,
                    itemType: "Task",
                  },
                  isRead: false,
                })
              } catch (notifError) {
                logger.error(
                  `Error creating task assignment notification for new assignee ${assigneeId}: ${notifError.message}`,
                )
                return null
              }
            })
            .filter(Boolean)

          await Promise.all(notificationPromises)
        }
      } catch (notificationError) {
        logger.error(`Error creating task update notifications: ${notificationError.message}`)
        // Continue execution even if notification creation fails
      }

      return updatedTask
    } catch (error) {
      logger.error(`Error updating task: ${error.message}`)
      throw error
    }
  }

  /**
   * Delete task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID making the deletion
   * @returns {boolean} - Success status
   */
  async deleteTask(taskId, userId) {
    try {
      const task = await Task.findById(taskId)

      if (!task) {
        throw new Error("Task not found")
      }

      // Delete the task
      await Task.findByIdAndDelete(taskId)

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Deleted task",
        details: `Task "${task.title}" was deleted`,
        relatedItem: {
          itemId: task._id,
          itemType: "Task",
        },
      })

      return true
    } catch (error) {
      logger.error(`Error deleting task: ${error.message}`)
      throw error
    }
  }

  /**
   * Move task to another board
   * @param {string} taskId - Task ID
   * @param {string} targetBoardId - Target board ID
   * @param {string} userId - User ID making the move
   * @returns {Object} - Updated task
   */
  async moveTask(taskId, targetBoardId, userId) {
    try {
      const task = await Task.findById(taskId)

      if (!task) {
        throw new Error("Task not found")
      }

      // Check if target board exists
      const targetBoard = await Board.findById(targetBoardId)
      if (!targetBoard) {
        throw new Error("Target board not found")
      }

      // Get the highest order value for existing tasks in the target board
      const highestOrderTask = await Task.findOne({ board: targetBoardId }).sort({ order: -1 })

      const order = highestOrderTask ? highestOrderTask.order + 1 : 0

      // Update the task
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { board: targetBoardId, order },
        { new: true, runValidators: true },
      ).populate("assignees", "name email profilePicture")

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Moved task",
        details: `Task "${task.title}" was moved to board "${targetBoard.title}"`,
        relatedItem: {
          itemId: task._id,
          itemType: "Task",
        },
      })

      return updatedTask
    } catch (error) {
      logger.error(`Error moving task: ${error.message}`)
      throw error
    }
  }

  /**
   * Reorder tasks
   * @param {string} boardId - Board ID
   * @param {Array} taskOrders - Array of {id, order} objects
   * @param {string} userId - User ID making the update
   * @returns {Array} - Updated tasks
   */
  async reorderTasks(boardId, taskOrders, userId) {
    try {
      // Check if board exists
      const board = await Board.findById(boardId)
      if (!board) {
        throw new Error("Board not found")
      }

      // Update each task's order
      const updatePromises = taskOrders.map(({ id, order }) =>
        Task.findByIdAndUpdate(id, { order }, { new: true }).populate("assignees", "name email profilePicture"),
      )

      const updatedTasks = await Promise.all(updatePromises)

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Reordered tasks",
        details: `Tasks in board "${board.title}" were reordered`,
        relatedItem: {
          itemId: board._id,
          itemType: "Board",
        },
      })

      return updatedTasks
    } catch (error) {
      logger.error(`Error reordering tasks: ${error.message}`)
      throw error
    }
  }
}

module.exports = new TaskService()

