// Team service
const Project = require("../models/project.model")
const User = require("../models/user.model")
const ActivityLog = require("../models/activityLog.model")
const Notification = require("../models/notification.model")
const logger = require("../utils/logger")
const notificationService = require("./notification.service")

class TeamService {
  /**
   * Add team member to project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID to add
   * @param {string} role - Role in the project (Viewer, Editor, etc.)
   * @param {string} addedBy - User ID who added the member
   * @returns {Object} - Updated project
   */
  async addTeamMember(projectId, userId, role, addedBy) {
    try {
      // Check if project exists
      const project = await Project.findById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Check if user exists
      const user = await User.findById(userId)
      if (!user) {
        throw new Error("User not found")
      }

      // Check if user is already a team member
      if (project.members.some((member) => member.toString() === userId)) {
        throw new Error("User is already a team member")
      }

      // Add user to project members
      project.members.push(userId)

      // If role is specified, add to team roles
      if (role) {
        project.teamRoles = project.teamRoles || {}
        project.teamRoles[userId] = role
      }

      await project.save()

      // Create activity log
      await ActivityLog.create({
        user: addedBy,
        action: "Added team member",
        details: `${user.name} was added to project "${project.title}"`,
        relatedItem: {
          itemId: project._id,
          itemType: "Project",
        },
      })

      // Create notification for the added user
      await notificationService.createProjectAssignmentNotification(project._id, project.title, addedBy, userId)

      return project
    } catch (error) {
      logger.error(`Error adding team member: ${error.message}`)
      throw error
    }
  }

  /**
   * Remove team member from project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID to remove
   * @param {string} removedBy - User ID who removed the member
   * @returns {Object} - Updated project
   */
  async removeTeamMember(projectId, userId, removedBy) {
    try {
      // Check if project exists
      const project = await Project.findById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Check if user is a team member
      if (!project.members.some((member) => member.toString() === userId)) {
        throw new Error("User is not a team member")
      }

      // Get user for activity log
      const user = await User.findById(userId)

      // Remove user from project members
      project.members = project.members.filter((member) => member.toString() !== userId)

      // Remove from team roles if exists
      if (project.teamRoles && project.teamRoles[userId]) {
        delete project.teamRoles[userId]
      }

      await project.save()

      // Create activity log
      await ActivityLog.create({
        user: removedBy,
        action: "Removed team member",
        details: `${user.name} was removed from project "${project.title}"`,
        relatedItem: {
          itemId: project._id,
          itemType: "Project",
        },
      })

      // Create notification for the removed user
      await Notification.create({
        type: "Project Removal",
        title: "Project Removal",
        message: `You have been removed from the project "${project.title}"`,
        sender: removedBy,
        recipient: userId,
        relatedItem: {
          itemId: project._id,
          itemType: "Project",
        },
      })

      return project
    } catch (error) {
      logger.error(`Error removing team member: ${error.message}`)
      throw error
    }
  }

  /**
   * Update team member role
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID to update
   * @param {string} role - New role
   * @param {string} updatedBy - User ID who updated the role
   * @returns {Object} - Updated project
   */
  async updateTeamMemberRole(projectId, userId, role, updatedBy) {
    try {
      // Check if project exists
      const project = await Project.findById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Check if user is a team member
      if (!project.members.some((member) => member.toString() === userId)) {
        throw new Error("User is not a team member")
      }

      // Get user for activity log
      const user = await User.findById(userId)

      // Update team role
      project.teamRoles = project.teamRoles || {}
      const oldRole = project.teamRoles[userId] || "Member"
      project.teamRoles[userId] = role

      await project.save()

      // Create activity log
      await ActivityLog.create({
        user: updatedBy,
        action: "Updated team member role",
        details: `${user.name}'s role in project "${project.title}" was changed from ${oldRole} to ${role}`,
        relatedItem: {
          itemId: project._id,
          itemType: "Project",
        },
      })

      // Create notification for the user
      await notificationService.createTeamRoleUpdateNotification(project._id, project.title, updatedBy, userId, role)

      return project
    } catch (error) {
      logger.error(`Error updating team member role: ${error.message}`)
      throw error
    }
  }

  /**
   * Get team members for a project
   * @param {string} projectId - Project ID
   * @returns {Array} - Team members with roles
   */
  async getTeamMembers(projectId) {
    try {
      // Check if project exists
      const project = await Project.findById(projectId)
        .populate("manager", "name email profilePicture")
        .populate("members", "name email profilePicture")

      if (!project) {
        throw new Error("Project not found")
      }

      // Format team members with roles
      const manager = {
        user: project.manager,
        role: "Manager",
        isManager: true,
      }

      const members = project.members.map((member) => ({
        user: member,
        role: project.teamRoles && project.teamRoles[member._id] ? project.teamRoles[member._id] : "Member",
        isManager: false,
      }))

      return [manager, ...members]
    } catch (error) {
      logger.error(`Error getting team members: ${error.message}`)
      throw error
    }
  }
}

module.exports = new TeamService()

