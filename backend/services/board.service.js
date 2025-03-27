// Board service
const Board = require("../models/board.model")
const Project = require("../models/project.model")
const ActivityLog = require("../models/activityLog.model")
const Notification = require("../models/notification.model")
const logger = require("../utils/logger")
const notificationService = require("./notification.service")

class BoardService {
  /**
   * Create a new board
   * @param {Object} boardData - Board data
   * @param {string} userId - Creator user ID
   * @returns {Object} - Newly created board
   */
  async createBoard(boardData, userId) {
    try {
      // Check if project exists
      const project = await Project.findById(boardData.project)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get the highest order value for existing boards in this project
      const highestOrderBoard = await Board.findOne({ project: boardData.project }).sort({ order: -1 })

      const order = highestOrderBoard ? highestOrderBoard.order + 1 : 0

      // Create the board
      const board = new Board({
        ...boardData,
        order,
      })

      await board.save()

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Created board",
        details: `Board "${board.title}" was created in project "${project.title}"`,
        relatedItem: {
          itemId: board._id,
          itemType: "Board",
        },
      })

      // Create notifications for project members
      try {
        logger.info(
          `Creating board notifications for project ${project._id} with ${project.members ? project.members.length : 0} members`,
        )

        // Directly create notifications for all project members except the creator
        if (project.members && project.members.length > 0) {
          const notificationPromises = project.members
            .map(async (memberId) => {
              // Don't notify the creator
              if (memberId.toString() === userId.toString()) return null

              try {
                // Create notification directly using the Notification model
                return await Notification.create({
                  recipient: memberId,
                  sender: userId,
                  message: `A new board "${board.title}" was created in project "${project.title}"`,
                  relatedItem: {
                    itemId: board._id,
                    itemType: "Board",
                  },
                  isRead: false,
                })
              } catch (notifError) {
                logger.error(`Error creating notification for member ${memberId}: ${notifError.message}`)
                return null
              }
            })
            .filter(Boolean)

          await Promise.all(notificationPromises)
          logger.info(`Created ${notificationPromises.length} board notifications`)
        } else {
          logger.info(`No members to notify for project ${project._id}`)
        }
      } catch (notificationError) {
        logger.error(`Error creating board notifications: ${notificationError.message}`)
        // Continue execution even if notification creation fails
      }

      return board
    } catch (error) {
      logger.error(`Error creating board: ${error.message}`)
      throw error
    }
  }

  /**
   * Get all boards for a project
   * @param {string} projectId - Project ID
   * @returns {Array} - List of boards
   */
  async getBoardsByProject(projectId) {
    try {
      // Check if project exists
      const project = await Project.findById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get all boards for the project
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
   * @returns {Object} - Board data
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
   * Update board
   * @param {string} boardId - Board ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID making the update
   * @returns {Object} - Updated board
   */
  async updateBoard(boardId, updateData, userId) {
    try {
      const board = await Board.findById(boardId)

      if (!board) {
        throw new Error("Board not found")
      }

      // Update the board
      const updatedBoard = await Board.findByIdAndUpdate(boardId, updateData, { new: true, runValidators: true })

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Updated board",
        details: `Board "${board.title}" was updated`,
        relatedItem: {
          itemId: board._id,
          itemType: "Board",
        },
      })

      return updatedBoard
    } catch (error) {
      logger.error(`Error updating board: ${error.message}`)
      throw error
    }
  }

  /**
   * Delete board
   * @param {string} boardId - Board ID
   * @param {string} userId - User ID making the deletion
   * @returns {boolean} - Success status
   */
  async deleteBoard(boardId, userId) {
    try {
      const board = await Board.findById(boardId)

      if (!board) {
        throw new Error("Board not found")
      }

      // Delete the board
      await Board.findByIdAndDelete(boardId)

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Deleted board",
        details: `Board "${board.title}" was deleted`,
        relatedItem: {
          itemId: board._id,
          itemType: "Board",
        },
      })

      return true
    } catch (error) {
      logger.error(`Error deleting board: ${error.message}`)
      throw error
    }
  }

  /**
   * Reorder boards
   * @param {string} projectId - Project ID
   * @param {Array} boardOrders - Array of {id, order} objects
   * @param {string} userId - User ID making the update
   * @returns {Array} - Updated boards
   */
  async reorderBoards(projectId, boardOrders, userId) {
    try {
      // Check if project exists
      const project = await Project.findById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Update each board's order
      const updatePromises = boardOrders.map(({ id, order }) => Board.findByIdAndUpdate(id, { order }, { new: true }))

      const updatedBoards = await Promise.all(updatePromises)

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Reordered boards",
        details: `Boards in project "${project.title}" were reordered`,
        relatedItem: {
          itemId: project._id,
          itemType: "Project",
        },
      })

      return updatedBoards
    } catch (error) {
      logger.error(`Error reordering boards: ${error.message}`)
      throw error
    }
  }
}

module.exports = new BoardService()

