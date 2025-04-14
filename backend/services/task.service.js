// Task service
const Task = require("../models/task.model")
const Board = require("../models/board.model")
const ActivityLog = require("../models/activityLog.model")
const logger = require("../utils/logger")

class TaskService {
  /**
   * Get all tasks for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of tasks
   */
  async getAllTasks(userId) {
    try {
      // Find all tasks where the user is an assignee
      const tasks = await Task.find({ assignees: userId })
        .populate("assignees", "name email profilePicture")
        .populate("board", "title project")
        .sort({ createdAt: -1 })

      return tasks
    } catch (error) {
      logger.error(`Error getting all tasks: ${error.message}`)
      throw error
    }
  }

  /**
   * Get tasks by board
   * @param {string} boardId - Board ID
   * @returns {Promise<Array>} - Array of tasks
   */
  async getTasksByBoard(boardId) {
    try {
      // Check if board exists
      const board = await Board.findById(boardId)
      if (!board) {
        throw new Error("Board not found")
      }

      // Find all tasks for the board
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
   * @returns {Promise<Object>} - Task object
   */
  async getTaskById(taskId) {
    try {
      const task = await Task.findById(taskId)
        .populate("assignees", "name email profilePicture")
        .populate("board", "title project")

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
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created task
   */
  async createTask(taskData, userId) {
    try {
      // Get the highest order value for tasks in this board
      const highestOrderTask = await Task.findOne({ board: taskData.board }).sort({ order: -1 })

      const newOrder = highestOrderTask ? highestOrderTask.order + 1 : 0

      // Create task with the next order value
      const task = await Task.create({
        ...taskData,
        order: newOrder,
        createdBy: userId,
      })

      // Populate assignees
      await task.populate("assignees", "name email profilePicture")

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Task created",
        details: `Task "${task.title}" created`,
        relatedItem: {
          itemId: task._id,
          itemType: "Task",
        },
        board: task.board,
      })

      return task
    } catch (error) {
      logger.error(`Error creating task: ${error.message}`)
      throw error
    }
  }

  /**
   * Update a task
   * @param {string} taskId - Task ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated task
   */
  async updateTask(taskId, updateData, userId) {
    try {
      // Find task
      const task = await Task.findById(taskId)
      if (!task) {
        throw new Error("Task not found")
      }

      // Update task fields
      Object.keys(updateData).forEach((key) => {
        if (key !== "board" && key !== "order") {
          // Don't allow changing board or order directly
          task[key] = updateData[key]
        }
      })

      await task.save()

      // Populate assignees
      await task.populate("assignees", "name email profilePicture")

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Task updated",
        details: `Task "${task.title}" updated`,
        relatedItem: {
          itemId: task._id,
          itemType: "Task",
        },
        board: task.board,
      })

      return task
    } catch (error) {
      logger.error(`Error updating task: ${error.message}`)
      throw error
    }
  }

  /**
   * Delete a task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteTask(taskId, userId) {
    try {
      // Find task
      const task = await Task.findById(taskId)
      if (!task) {
        throw new Error("Task not found")
      }

      const boardId = task.board
      const taskTitle = task.title

      // Delete task
      await task.deleteOne()

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Task deleted",
        details: `Task "${taskTitle}" deleted`,
        relatedItem: {
          itemId: taskId,
          itemType: "Task",
        },
        board: boardId,
      })

      // Reorder remaining tasks
      const remainingTasks = await Task.find({ board: boardId }).sort({ order: 1 })

      for (let i = 0; i < remainingTasks.length; i++) {
        remainingTasks[i].order = i
        await remainingTasks[i].save()
      }

      return true
    } catch (error) {
      logger.error(`Error deleting task: ${error.message}`)
      throw error
    }
  }

  /**
   * Move a task to another board
   * @param {string} taskId - Task ID
   * @param {string} targetBoardId - Target board ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Moved task
   */
  async moveTask(taskId, targetBoardId, userId) {
    try {
      // Find task
      const task = await Task.findById(taskId)
      if (!task) {
        throw new Error("Task not found")
      }

      // Check if target board exists
      const targetBoard = await Board.findById(targetBoardId)
      if (!targetBoard) {
        throw new Error("Target board not found")
      }

      const sourceBoardId = task.board

      // Get the highest order value for tasks in the target board
      const highestOrderTask = await Task.findOne({ board: targetBoardId }).sort({ order: -1 })

      const newOrder = highestOrderTask ? highestOrderTask.order + 1 : 0

      // Update task
      task.board = targetBoardId
      task.order = newOrder
      await task.save()

      // Populate assignees
      await task.populate("assignees", "name email profilePicture")

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Task moved",
        details: `Task "${task.title}" moved to another board`,
        relatedItem: {
          itemId: task._id,
          itemType: "Task",
        },
        board: targetBoardId,
      })

      // Reorder tasks in the source board
      if (sourceBoardId.toString() !== targetBoardId.toString()) {
        const sourceBoardTasks = await Task.find({ board: sourceBoardId }).sort({ order: 1 })

        for (let i = 0; i < sourceBoardTasks.length; i++) {
          sourceBoardTasks[i].order = i
          await sourceBoardTasks[i].save()
        }
      }

      return task
    } catch (error) {
      logger.error(`Error moving task: ${error.message}`)
      throw error
    }
  }

  /**
   * Reorder tasks within a board
   * @param {string} boardId - Board ID
   * @param {Array} taskOrders - Array of task IDs and their new orders
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async reorderTasks(boardId, taskOrders, userId) {
    try {
      // Check if board exists
      const board = await Board.findById(boardId)
      if (!board) {
        throw new Error("Board not found")
      }

      // Update order for each task
      for (const taskOrder of taskOrders) {
        const { taskId, order } = taskOrder

        const task = await Task.findById(taskId)
        if (task && task.board.toString() === boardId) {
          task.order = order
          await task.save()
        }
      }

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Tasks reordered",
        details: "Tasks reordered in board",
        relatedItem: {
          itemId: boardId,
          itemType: "Board",
        },
        board: boardId,
      })

      return true
    } catch (error) {
      logger.error(`Error reordering tasks: ${error.message}`)
      throw error
    }
  }

  /**
   * Get task statistics for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} - Task statistics
   */
  async getTaskStatsByProject(projectId) {
    try {
      // Get all boards for the project
      const boards = await Board.find({ project: projectId })

      if (boards.length === 0) {
        return {
          totalTasks: 0,
          completedTasks: 0,
          progressPercentage: 0,
          tasksByStatus: {
            todo: 0,
            inProgress: 0,
            inReview: 0,
            done: 0,
          },
        }
      }

      const boardIds = boards.map((board) => board._id)

      // Get all tasks for the boards
      const tasks = await Task.find({ board: { $in: boardIds } })

      // Calculate statistics
      const totalTasks = tasks.length
      const completedTasks = tasks.filter((task) => task.status === "Done").length
      const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

      // Count tasks by status
      const tasksByStatus = {
        todo: tasks.filter((task) => task.status === "To Do").length,
        inProgress: tasks.filter((task) => task.status === "In Progress").length,
        inReview: tasks.filter((task) => task.status === "In Review").length,
        done: completedTasks,
      }

      return {
        totalTasks,
        completedTasks,
        progressPercentage,
        tasksByStatus,
      }
    } catch (error) {
      logger.error(`Error getting task statistics: ${error.message}`)
      throw error
    }
  }
}

module.exports = new TaskService()
