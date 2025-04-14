const Task = require('../models/task.model');
const Board = require('../models/board.model');
const Project = require('../models/project.model');
const logger = require('../utils/logger');

class SearchService {
  /**
   * Search across tasks, boards, and projects
   * @param {string} userId - User ID
   * @param {string} query - Search query
   * @returns {Object} - Search results
   */
  async search(userId, query) {
    try {
      // Create a regex pattern that matches the beginning of the text
      const regexPattern = new RegExp(`^${query}`, 'i');

      // Search tasks where user is an assignee
      const tasks = await Task.find({
        assignees: userId,
        $or: [
          { title: { $regex: regexPattern } },
          { description: { $regex: regexPattern } }
        ]
      })
        .populate('assignees', 'name email profilePicture')
        .populate('board', 'title project')
        .limit(5);

      // First, find all projects where the user is a member
      const userProjects = await Project.find({
        $or: [
          { manager: userId },
          { members: userId }
        ]
      }).select('_id');

      const projectIds = userProjects.map(project => project._id);

      // Search boards in projects where user is a member
      const boards = await Board.find({
        project: { $in: projectIds },
        $or: [
          { title: { $regex: regexPattern } },
          { description: { $regex: regexPattern } }
        ]
      })
        .populate({
          path: 'project',
          select: 'title description',
        })
        .limit(5);

      // Search projects where user is a member
      const projects = await Project.find({
        $or: [
          { title: { $regex: regexPattern } },
          { description: { $regex: regexPattern } }
        ],
        $or: [
          { manager: userId },
          { members: userId }
        ]
      })
        .populate('manager', 'name email profilePicture')
        .populate('members', 'name email profilePicture')
        .limit(5);

      return {
        tasks,
        boards,
        projects
      };
    } catch (error) {
      logger.error(`Error searching: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SearchService(); 