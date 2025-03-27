// Team controller
const teamService = require("../services/team.service")
const projectService = require("../services/project.service")
const ApiResponse = require("../utils/apiResponse")
const logger = require("../utils/logger")

class TeamController {
  /**
   * Add team member to project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addTeamMember(req, res) {
    try {
      const { projectId } = req.params
      const { userId, role } = req.body

      // Check if project exists and user has permission
      const project = await projectService.getProjectById(projectId)

      if (req.userRole !== "Admin" && project.manager.toString() !== req.userId) {
        return ApiResponse.error(res, "Not authorized to add team members to this project", 403)
      }

      const updatedProject = await teamService.addTeamMember(projectId, userId, role, req.userId)

      return ApiResponse.success(res, "Team member added successfully", { project: updatedProject })
    } catch (error) {
      logger.error(`Error adding team member: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Project not found"
          ? "Project not found"
          : error.message === "User not found"
            ? "User not found"
            : error.message === "User is already a team member"
              ? "User is already a team member"
              : "Error adding team member",
        error.message === "Project not found" || error.message === "User not found" ? 404 : 400,
      )
    }
  }

  /**
   * Remove team member from project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeTeamMember(req, res) {
    try {
      const { projectId, userId } = req.params

      // Check if project exists and user has permission
      const project = await projectService.getProjectById(projectId)

      if (req.userRole !== "Admin" && project.manager.toString() !== req.userId) {
        return ApiResponse.error(res, "Not authorized to remove team members from this project", 403)
      }

      const updatedProject = await teamService.removeTeamMember(projectId, userId, req.userId)

      return ApiResponse.success(res, "Team member removed successfully", { project: updatedProject })
    } catch (error) {
      logger.error(`Error removing team member: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Project not found"
          ? "Project not found"
          : error.message === "User is not a team member"
            ? "User is not a team member"
            : "Error removing team member",
        error.message === "Project not found" ? 404 : 400,
      )
    }
  }

  /**
   * Update team member role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTeamMemberRole(req, res) {
    try {
      const { projectId, userId } = req.params
      const { role } = req.body

      // Check if project exists and user has permission
      const project = await projectService.getProjectById(projectId)

      if (req.userRole !== "Admin" && project.manager.toString() !== req.userId) {
        return ApiResponse.error(res, "Not authorized to update team member roles in this project", 403)
      }

      const updatedProject = await teamService.updateTeamMemberRole(projectId, userId, role, req.userId)

      return ApiResponse.success(res, "Team member role updated successfully", { project: updatedProject })
    } catch (error) {
      logger.error(`Error updating team member role: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Project not found"
          ? "Project not found"
          : error.message === "User is not a team member"
            ? "User is not a team member"
            : "Error updating team member role",
        error.message === "Project not found" ? 404 : 400,
      )
    }
  }

  /**
   * Get team members for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTeamMembers(req, res) {
    try {
      const { projectId } = req.params

      // Check if project exists and user has permission
      const project = await projectService.getProjectById(projectId)

      if (
        req.userRole !== "Admin" &&
        project.manager.toString() !== req.userId &&
        !project.members.some((member) => member._id.toString() === req.userId)
      ) {
        return ApiResponse.error(res, "Not authorized to view team members for this project", 403)
      }

      const teamMembers = await teamService.getTeamMembers(projectId)

      return ApiResponse.success(res, "Team members retrieved successfully", { teamMembers })
    } catch (error) {
      logger.error(`Error getting team members: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Project not found" ? "Project not found" : "Error retrieving team members",
        error.message === "Project not found" ? 404 : 500,
      )
    }
  }
}

module.exports = new TeamController()

