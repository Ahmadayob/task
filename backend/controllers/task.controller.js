// Task controller
const taskService = require('../services/task.service');
const boardService = require('../services/board.service');
const projectService = require('../services/project.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

class TaskController {
  /**
   * Create a new task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createTask(req, res) {
    try {
      // Get board to check permissions
      const board = await boardService.getBoardById(req.body.board);
      
      // Get project to check permissions
      const project = await projectService.getProjectById(board.project);
      
      // Check if user has access to the project
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !project.members.some(member => member._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to create task in this board', 403);
      }
      
      const task = await taskService.createTask(req.body, req.userId);
      
      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        // Notify all project members
        project.members.forEach(member => {
          io.to(member.toString()).emit('task:created', { task, boardId: board._id });
        });
      }
      
      return ApiResponse.success(res, 'Task created successfully', { task }, 201);
    } catch (error) {
      logger.error(`Error creating task: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Board not found' ? 'Board not found' : 'Error creating task', 
        error.message === 'Board not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Get all tasks for a board
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTasksByBoard(req, res) {
    try {
      const { boardId } = req.params;
      
      // Get board to check permissions
      const board = await boardService.getBoardById(boardId);
      
      // Get project to check permissions
      const project = await projectService.getProjectById(board.project);
      
      // Check if user has access to the project
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !project.members.some(member => member._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to access tasks in this board', 403);
      }
      
      const tasks = await taskService.getTasksByBoard(boardId);
      
      return ApiResponse.success(res, 'Tasks retrieved successfully', { tasks });
    } catch (error) {
      logger.error(`Error getting tasks by board: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Board not found' ? 'Board not found' : 'Error retrieving tasks', 
        error.message === 'Board not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Get task by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      
      // Get board to check permissions
      const board = await boardService.getBoardById(task.board);
      
      // Get project to check permissions
      const project = await projectService.getProjectById(board.project);
      
      // Check if user has access to the project
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !project.members.some(member => member._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to access this task', 403);
      }
      
      return ApiResponse.success(res, 'Task retrieved successfully', { task });
    } catch (error) {
      logger.error(`Error getting task by ID: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Task not found' ? 'Task not found' : 'Error retrieving task', 
        error.message === 'Task not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Update task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      
      // Get task to check permissions
      const task = await taskService.getTaskById(id);
      
      // Get board to check permissions
      const board = await boardService.getBoardById(task.board);
      
      // Get project to check permissions
      const project = await projectService.getProjectById(board.project);
      
      // Check if user has permission to update this task
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !task.assignees.some(assignee => assignee._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to update this task', 403);
      }
      
      const updatedTask = await taskService.updateTask(id, req.body, req.userId);
      
      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        // Notify all project members
        project.members.forEach(member => {
          io.to(member.toString()).emit('task:updated', { task: updatedTask, boardId: board._id });
        });
      }
      
      return ApiResponse.success(res, 'Task updated successfully', { task: updatedTask });
    } catch (error) {
      logger.error(`Error updating task: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Task not found' ? 'Task not found' : 'Error updating task', 
        error.message === 'Task not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Delete task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      
      // Get task to check permissions
      const task = await taskService.getTaskById(id);
      
      // Get board to check permissions
      const board = await boardService.getBoardById(task.board);
      
      // Get project to check permissions
      const project = await projectService.getProjectById(board.project);
      
      // Check if user has permission to delete this task
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !task.assignees.some(assignee => assignee._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to delete this task', 403);
      }
      
      await taskService.deleteTask(id, req.userId);
      
      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        // Notify all project members
        project.members.forEach(member => {
          io.to(member.toString()).emit('task:deleted', { taskId: id, boardId: board._id });
        });
      }
      
      return ApiResponse.success(res, 'Task deleted successfully');
    } catch (error) {
      logger.error(`Error deleting task: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Task not found' ? 'Task not found' : 'Error deleting task', 
        error.message === 'Task not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Move task to another board
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async moveTask(req, res) {
    try {
      const { id } = req.params;
      const { targetBoardId } = req.body;
      
      if (!targetBoardId) {
        return ApiResponse.error(res, 'Target board ID is required', 400);
      }
      
      // Get task to check permissions
      const task = await taskService.getTaskById(id);
      
      // Get source board
      const sourceBoard = await boardService.getBoardById(task.board);
      
      // Get target board
      const targetBoard = await boardService.getBoardById(targetBoardId);
      
      // Get project to check permissions
      const project = await projectService.getProjectById(sourceBoard.project);
      
      // Check if target board belongs to the same project
      if (sourceBoard.project.toString() !== targetBoard.project.toString()) {
        return ApiResponse.error(res, 'Cannot move task to a board in a different project', 400);
      }
      
      // Check if user has permission to move this task
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !task.assignees.some(assignee => assignee._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to move this task', 403);
      }
      
      const updatedTask = await taskService.moveTask(id, targetBoardId, req.userId);
      
      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        // Notify all project members
        project.members.forEach(member => {
          io.to(member.toString()).emit('task:moved', { 
            task: updatedTask, 
            sourceBoardId: sourceBoard._id,
            targetBoardId
          });
        });
      }
      
      return ApiResponse.success(res, 'Task moved successfully', { task: updatedTask });
    } catch (error) {
      logger.error(`Error moving task: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Task not found' || error.message === 'Target board not found'
          ? error.message 
          : 'Error moving task', 
        error.message === 'Task not found' || error.message === 'Target board not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Reorder tasks
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async reorderTasks(req, res) {
    try {
      const { boardId } = req.params;
      const { taskOrders } = req.body;
      
      if (!taskOrders || !Array.isArray(taskOrders)) {
        return ApiResponse.error(res, 'Invalid task orders data', 400);
      }
      
      // Get board to check permissions
      const board = await boardService.getBoardById(boardId);
      
      // Get project to check permissions
      const project = await projectService.getProjectById(board.project);
      
      // Check if user has access to the project
      if (req.userRole !== 'Admin' && 
          project.manager._id.toString() !== req.userId && 
          !project.members.some(member => member._id.toString() === req.userId)) {
        return ApiResponse.error(res, 'Unauthorized to reorder tasks in this board', 403);
      }
      
      const updatedTasks = await taskService.reorderTasks(boardId, taskOrders, req.userId);
      
      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        // Notify all project members
        project.members.forEach(member => {
          io.to(member.toString()).emit('tasks:reordered', { tasks: updatedTasks, boardId });
        });
      }
      
      return ApiResponse.success(res, 'Tasks reordered successfully', { tasks: updatedTasks });
    } catch (error) {
      logger.error(`Error reordering tasks: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'Board not found' ? 'Board not found' : 'Error reordering tasks', 
        error.message === 'Board not found' ? 404 : 500
      );
    }
  }
}

module.exports = new TaskController();