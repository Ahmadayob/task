// Project controller
const projectService = require('../services/project.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

class ProjectController {
  /**
   * Create a new project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createProject(req, res) {
    try {
      const project = await projectService.createProject(req.body, req.userId);
      return ApiResponse.success(res, 'Project created successfully', { project }, 201);
    } catch (error) {
      logger.error(`Error creating project: ${error.message}`);
      return ApiResponse.error(res, 'Error creating project', 500);
    }
  }
  
  /**
   * Get all projects
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllProjects(req, res) {
    try {
      const { page, limit, sortBy, sortOrder, search } = req.query;
      
      // Build filter based on search query and user role
      const filter = {};
      if (search) {
        filter.title = { $regex: search, $options: 'i' };
      }
      
      // If not admin, only show projects where user is manager or member
      if (req.userRole !== 'Admin') {
        filter.$or = [
          { manager: req.userId },
          { members: req.userId }
        ];
      }
      
      const options = { page, limit, sortBy, sortOrder };
      const result = await projectService.getAllProjects(filter, options);
      
      return ApiResponse.success(res, 'Projects retrieved successfully', result);
    } catch (error) {
      logger.error(`Error getting projects: ${error.message}`);
      return ApiResponse.error(res, 'Error retrieving projects', 500);
    }
  }
  
  /**
   * Get project by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      
      // Check if user has access to this project
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !project.members.some(member => member._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to access this project', 403);
      }
      
      return ApiResponse.success(res, 'Project retrieved successfully', { project });
    } catch (error) {
      logger.error(`Error getting project by ID: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Project not found' ? 'Project not found' : 'Error retrieving project', 
        error.message === 'Project not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Update project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      
      // Get project to check permissions
      const project = await projectService.getProjectById(id);
      
      // Check if user has permission to update this project
      if (req.userRole !== 'Admin' && project.manager._id.toString() !== req.userId) {
        return ApiResponse.error(res, 'Unauthorized to update this project', 403);
      }
      
      const updatedProject = await projectService.updateProject(id, req.body, req.userId);
      
      return ApiResponse.success(res, 'Project updated successfully', { project: updatedProject });
    } catch (error) {
      logger.error(`Error updating project: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Project not found' ? 'Project not found' : 'Error updating project', 
        error.message === 'Project not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Delete project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      
      // Get project to check permissions
      const project = await projectService.getProjectById(id);
      
      // Check if user has permission to delete this project
      if (req.userRole !== 'Admin' && project.manager._id.toString() !== req.userId) {
        return ApiResponse.error(res, 'Unauthorized to delete this project', 403);
      }
      
      await projectService.deleteProject(id, req.userId);
      
      return ApiResponse.success(res, 'Project deleted successfully');
    } catch (error) {
      logger.error(`Error deleting project: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Project not found' ? 'Project not found' : 'Error deleting project', 
        error.message === 'Project not found' ? 404 : 500
      );
    }
  }
}

module.exports = new ProjectController();