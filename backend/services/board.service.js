// Board service
const Board = require("../models/board.model")
const Project = require("../models/project.model")
const Task = require("../models/task.model")
const ActivityLog = require("../models/activityLog.model")
const logger = require("../utils/logger")

class BoardService {
  /**
   * Create a new board
   * @param {Object} boardData - Board data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created board
   */
  async createBoard(boardData, userId) {
    try {
      // Check if project exists
      const project = await Project.findById(boardData.project)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get the highest order value for boards in this project
      const highestOrderBoard = await Board.findOne({ project: boardData.project }).sort({ order: -1 })

      const newOrder = highestOrderBoard ? highestOrderBoard.order + 1 : 0

      // Create board with the next order value
      const board = await Board.create({
        ...boardData,
        order: newOrder,
        status: boardData.status || "todo", // Default to 'todo' if not provided
      })

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Board created",
        details: `Board "${board.title}" created`,
        relatedItem: {
          itemId: board._id,
          itemType: "Board",
        },
        project: board.project,
      })

      return board
    } catch (error) {
      logger.error(`Error creating board: ${error.message}`)
      throw error
    }
  }

  /**
   * Get all boards for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} - Array of boards
   */
  async getBoardsByProject(projectId) {
    try {
      // Check if project exists
      const project = await Project.findById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Find all boards for the project
      const boards = await Board.find({ project: projectId }).sort({ order: 1 })

      return boards
    } catch (error) {
      logger.error(`Error getting boards by project: ${error.message}`)
      throw error
    }
  }

  /**
   * Get board by ID
   * @param {string} boardId - Board ID
   * @returns {Promise<Object>} - Board object
   */
  async getBoardById(boardId) {
    try {
      const board = await Board.findById(boardId)

      if (!board) {
        throw new Error("Board not found")
      }

      return board
    } catch (error) {
      logger.error(`Error getting board by ID: ${error.message}`)
      throw error
    }
  }

  /**
   * Update a board
   * @param {string} boardId - Board ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated board
   */
  async updateBoard(boardId, updateData, userId) {
    try {
      // Find board
      const board = await Board.findById(boardId)
      if (!board) {
        throw new Error("Board not found")
      }

      console.log("Updating board with data:", updateData)

      // Update board
      Object.keys(updateData).forEach((key) => {
        // Allow updating status field
        board[key] = updateData[key]
      })

      await board.save()

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Board updated",
        details: `Board "${board.title}" updated`,
        relatedItem: {
          itemId: board._id,
          itemType: "Board",
        },
        project: board.project,
      })

      return board
    } catch (error) {
      logger.error(`Error updating board: ${error.message}`)
      throw error
    }
  }

  /**
   * Delete a board
   * @param {string} boardId - Board ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteBoard(boardId, userId) {
    try {
      // Find board
      const board = await Board.findById(boardId)
      if (!board) {
        throw new Error("Board not found")
      }

      const projectId = board.project
      const boardTitle = board.title

      // Delete all tasks in the board
      await Task.deleteMany({ board: boardId })

      // Delete board
      await board.deleteOne()

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Board deleted",
        details: `Board "${boardTitle}" deleted`,
        relatedItem: {
          itemId: boardId,
          itemType: "Board",
        },
        project: projectId,
      })

      // Reorder remaining boards
      const remainingBoards = await Board.find({ project: projectId }).sort({ order: 1 })

      for (let i = 0; i < remainingBoards.length; i++) {
        remainingBoards[i].order = i
        await remainingBoards[i].save()
      }

      return true
    } catch (error) {
      logger.error(`Error deleting board: ${error.message}`)
      throw error
    }
  }

  /**
   * Reorder boards within a project
   * @param {string} projectId - Project ID
   * @param {Array} boardOrders - Array of board IDs and their new orders
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async reorderBoards(projectId, boardOrders, userId) {
    try {
      // Check if project exists
      const project = await Project.findById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Update order for each board
      for (const boardOrder of boardOrders) {
        const { boardId, order } = boardOrder

        const board = await Board.findById(boardId)
        if (board && board.project.toString() === projectId) {
          board.order = order
          await board.save()
        }
      }

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Boards reordered",
        details: "Boards reordered in project",
        relatedItem: {
          itemId: projectId,
          itemType: "Project",
        },
        project: projectId,
      })

      return true
    } catch (error) {
      logger.error(`Error reordering boards: ${error.message}`)
      throw error
    }
  }
}

module.exports = new BoardService()
