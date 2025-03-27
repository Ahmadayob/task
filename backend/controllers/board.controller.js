// Board controller
const boardService = require('../services/board.service');
const projectService = require('../services/project.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

class BoardController {
  /**
   * Create a new board
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createBoard(req, res) {
    try {
      // Check if user has access to the project
      const project = await projectService.getProjectById(req.body.project);
      
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !project.members.some(member => member._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to create board in this project', 403);
      }
      
      const board = await boardService.createBoard(req.body, req.userId);
      return ApiResponse.success(res, 'Board created successfully', { board }, 201);
    } catch (error) {
      logger.error(`Error creating board: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Project not found' ? 'Project not found' : 'Error creating board', 
        error.message === 'Project not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Get all boards for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBoardsByProject(req, res) {
    try {
      const { projectId } = req.params;
      
      // Check if user has access to the project
      const project = await projectService.getProjectById(projectId);
      
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !project.members.some(member => member._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to access boards in this project', 403);
      }
      
      const boards = await boardService.getBoardsByProject(projectId);
      
      return ApiResponse.success(res, 'Boards retrieved successfully', { boards });
    } catch (error) {
      logger.error(`Error getting boards by project: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Project not found' ? 'Project not found' : 'Error retrieving boards', 
        error.message === 'Project not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Get board by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBoardById(req, res) {
    try {
      const { id } = req.params;
      const board = await boardService.getBoardById(id);
      
      // Get project to check permissions
      const project = await projectService.getProjectById(board.project);
      
      // Check if user has access to this project
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !project.members.some(member => member._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to access this board', 403);
      }
      
      return ApiResponse.success(res, 'Board retrieved successfully', { board });
    } catch (error) {
      logger.error(`Error getting board by ID: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Board not found' ? 'Board not found' : 'Error retrieving board', 
        error.message === 'Board not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Update board
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateBoard(req, res) {
    try {
      const { id } = req.params;
      
      // Get board to check permissions
      const board = await boardService.getBoardById(id);
      
      // Get project to check permissions
      const project = await projectService.getProjectById(board.project);
      
      // Check if user has permission to update this board
      if (req.userRole !== 'Admin' && project.manager._id.toString() !== req.userId) {
        return ApiResponse.error(res, 'Unauthorized to update this board', 403);
      }
      
      const updatedBoard = await boardService.updateBoard(id, req.body, req.userId);
      
      return ApiResponse.success(res, 'Board updated successfully', { board: updatedBoard });
    } catch (error) {
      logger.error(`Error updating board: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Board not found' ? 'Board not found' : 'Error updating board', 
        error.message === 'Board not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Delete board
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteBoard(req, res) {
    try {
      const { id } = req.params;
      
      // Get board to check permissions
      const board = await boardService.getBoardById(id);
      
      // Get project to check permissions
      const project = await projectService.getProjectById(board.project);
      
      // Check if user has permission to delete this board
      if (req.userRole !== 'Admin' && project.manager._id.toString() !== req.userId) {
        return ApiResponse.error(res, 'Unauthorized to delete this board', 403);
      }
      
      await boardService.deleteBoard(id, req.userId);
      
      return ApiResponse.success(res, 'Board deleted successfully');
    } catch (error) {
      logger.error(`Error deleting board: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Board not found' ? 'Board not found' : 'Error deleting board', 
        error.message === 'Board not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Reorder boards
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async reorderBoards(req, res) {
    try {
      const { projectId } = req.params;
      const { boardOrders } = req.body;
      
      if (!boardOrders || !Array.isArray(boardOrders)) {
        return ApiResponse.error(res, 'Invalid board orders data', 400);
      }
      
      // Check if user has access to the project
      const project = await projectService.getProjectById(projectId);
      
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !project.members.some(member => member._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to reorder boards in this project', 403);
      }
      
      const updatedBoards = await boardService.reorderBoards(projectId, boardOrders, req.userId);
      
      return ApiResponse.success(res, 'Boards reordered successfully', { boards: updatedBoards });
    } catch (error) {
      logger.error(`Error reordering boards: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Project not found' ? 'Project not found' : 'Error reordering boards', 
        error.message === 'Project not found' ? 404 : 500
      );
    }
  }
}

module.exports = new BoardController();