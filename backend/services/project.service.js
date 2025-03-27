// Project service
const Project = require("../models/project.model")
const ActivityLog = require("../models/activityLog.model")
const Notification = require("../models/notification.model")
const logger = require("../utils/logger")

class ProjectService {
  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} userId - Creator user ID
   * @returns {Object} - Newly created project
   */
  async createProject(projectData, userId) {
    try {
      // Ensure members array includes the creator
      const members = [...new Set([...(projectData.members || []), userId])]

      // Create project with current user as manager
      const project = await Project.create({
        ...projectData,
        manager: userId,
        members: members,
      })

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Created project",
        details: `Project "${project.title}" was created`,
        relatedItem: {
          itemId: project._id,
          itemType: "Project",
        },
      })

      return project
    } catch (error) {
      logger.error(`Error creating project: ${error.message}`)
      throw error
    }
  }

  /**
   * Get all projects
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Object} - Projects and pagination info
   */
  async getAllProjects(filter = {}, options = {}) {
    try {
      const page = Number.parseInt(options.page, 10) || 1
      const limit = Number.parseInt(options.limit, 10) || 10
      const skip = (page - 1) * limit

      const sortBy = options.sortBy || "createdAt"
      const sortOrder = options.sortOrder === "asc" ? 1 : -1

      // Build query
      let query = Project.find(filter)
        .populate("manager", "name email profilePicture")
        .populate("members", "name email profilePicture")

      // Apply pagination
      query = query.skip(skip).limit(limit)

      // Apply sorting
      query = query.sort({ [sortBy]: sortOrder })

      // Execute query
      const projects = await query

      // Get total count
      const total = await Project.countDocuments(filter)

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error(`Error getting all projects: ${error.message}`)
      throw error
    }
  }

  /**
   * Get project by ID
   * @param {string} projectId - Project ID
   * @returns {Object} - Project data
   */
  async getProjectById(projectId) {
    try {
      const project = await Project.findById(projectId)
        .populate("manager", "name email profilePicture")
        .populate("members", "name email profilePicture")

      if (!project) {
        throw new Error("Project not found")
      }

      return project
    } catch (error) {
      logger.error(`Error getting project by ID: ${error.message}`)
      throw error
    }
  }

  /**
   * Update project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID making the update
   * @returns {Object} - Updated project
   */
  async updateProject(projectId, updateData, userId) {
    try {
      const project = await Project.findById(projectId)

      if (!project) {
        throw new Error("Project not found")
      }

      // Update project
      const updatedProject = await Project.findByIdAndUpdate(projectId, updateData, { new: true, runValidators: true })
        .populate("manager", "name email profilePicture")
        .populate("members", "name email profilePicture")

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Updated project",
        details: `Project "${project.title}" was updated`,
        relatedItem: {
          itemId: project._id,
          itemType: "Project",
        },
      })

      // Create notifications for project members
      try {
        if (project.members && project.members.length > 0) {
          const notificationPromises = project.members
            .map(async (memberId) => {
              // Don't notify the updater
              if (memberId.toString() === userId.toString()) return null

              try {
                return await Notification.create({
                  recipient: memberId,
                  sender: userId,
                  message: `Project "${project.title}" has been updated`,
                  relatedItem: {
                    itemId: project._id,
                    itemType: "Project",
                  },
                  isRead: false,
                })
              } catch (notifError) {
                logger.error(`Error creating project update notification for member ${memberId}: ${notifError.message}`)
                return null
              }
            })
            .filter(Boolean)

          await Promise.all(notificationPromises)
        }
      } catch (notificationError) {
        logger.error(`Error creating project update notifications: ${notificationError.message}`)
        // Continue execution even if notification creation fails
      }

      return updatedProject
    } catch (error) {
      logger.error(`Error updating project: ${error.message}`)
      throw error
    }
  }

  /**
   * Delete project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID making the deletion
   * @returns {boolean} - Success status
   */
  async deleteProject(projectId, userId) {
    try {
      const project = await Project.findById(projectId)

      if (!project) {
        throw new Error("Project not found")
      }

      // Delete project
      await Project.findByIdAndDelete(projectId)

      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: "Deleted project",
        details: `Project "${project.title}" was deleted`,
        relatedItem: {
          itemId: project._id,
          itemType: "Project",
        },
      })

      return true
    } catch (error) {
      logger.error(`Error deleting project: ${error.message}`)
      throw error
    }
  }
}

module.exports = new ProjectService()

