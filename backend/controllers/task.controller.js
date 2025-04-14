// Task controller
const taskService = require("../services/task.service")
const boardService = require("../services/board.service")
const projectService = require("../services/project.service")
const ApiResponse = require("../utils/apiResponse")
const logger = require("../utils/logger")

class TaskController {
  /**
   * Get all tasks for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllTasks(req, res) {
    try {
      const tasks = await taskService.getAllTasks(req.userId)
      return ApiResponse.success(res, "Tasks retrieved successfully", { tasks })
    } catch (error) {
      logger.error(`Error getting all tasks: ${error.message}`)
      return ApiResponse.error(res, "Error retrieving tasks", 500)
    }
  }

  /**
   * Get tasks by board
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTasksByBoard(req, res) {
    try {
      const { boardId } = req.params

      // Get board to check permissions
      const board = await boardService.getBoardById(boardId)
      if (!board) {
        return ApiResponse.error(res, "Board not found", 404)
      }

      // Get project to check permissions
      const project = await projectService.getProjectById(board.project)

      // Check if the user is authorized
      const isAdmin = req.userRole === "Admin"
      const isManager = project.manager.toString() === req.userId.toString()
      const isMember = project.members.some((member) => member.toString() === req.userId.toString())

      if (!isAdmin && !isManager && !isMember) {
        return ApiResponse.error(res, "Unauthorized to view tasks in this board", 403)
      }

      const tasks = await taskService.getTasksByBoard(boardId)
      return ApiResponse.success(res, "Tasks retrieved successfully", { tasks })
    } catch (error) {
      logger.error(`Error getting tasks by board: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Board not found" ? "Board not found" : "Error retrieving tasks",
        error.message === "Board not found" ? 404 : 500,
      )
    }
  }

  /**
   * Get task by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTaskById(req, res) {
    try {
      const { taskId } = req.params
      const task = await taskService.getTaskById(taskId)

      if (!task) {
        return ApiResponse.error(res, "Task not found", 404)
      }

      // Get board to check permissions
      const board = await boardService.getBoardById(task.board)

      // Get project to check permissions
      const project = await projectService.getProjectById(board.project)

      // Check if the user is authorized
      const isAdmin = req.userRole === "Admin"
      const isManager = project.manager.toString() === req.userId.toString()
      const isMember = project.members.some((member) => member.toString() === req.userId.toString())
      const isAssignee = task.assignees.some((assignee) => assignee.toString() === req.userId.toString())

      if (!isAdmin && !isManager && !isMember && !isAssignee) {
        return ApiResponse.error(res, "Unauthorized to view this task", 403)
      }

      return ApiResponse.success(res, "Task retrieved successfully", { task })
    } catch (error) {
      logger.error(`Error getting task by ID: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Task not found" ? "Task not found" : "Error retrieving task",
        error.message === "Task not found" ? 404 : 500,
      )
    }
  }

  /**
   * Create a new task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createTask(req, res) {
    try {
      const { board } = req.body

      // Get board to check permissions
      const boardDoc = await boardService.getBoardById(board)
      if (!boardDoc) {
        return ApiResponse.error(res, "Board not found", 404)
      }

      // Get project to check permissions
      const project = await projectService.getProjectById(boardDoc.project)

      // Check if the user is authorized
      const isAdmin = req.userRole === "Admin"
      const isManager = project.manager.toString() === req.userId.toString()
      const isMember = project.members.some((member) => member.toString() === req.userId.toString())

      if (!isAdmin && !isManager && !isMember) {
        return ApiResponse.error(res, "Unauthorized to create task in this board", 403)
      }

      const task = await taskService.createTask(req.body, req.userId)
      return ApiResponse.success(res, "Task created successfully", { task }, 201)
    } catch (error) {
      logger.error(`Error creating task: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Board not found" ? "Board not found" : "Error creating task",
        error.message === "Board not found" ? 404 : 500,
      )
    }
  }

  /**
   * Update a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTask(req, res) {
    try {
      const { taskId } = req.params

      // Get task to check permissions
      const task = await taskService.getTaskById(taskId)
      if (!task) {
        return ApiResponse.error(res, "Task not found", 404)
      }

      // Get board to check permissions
      const board = await boardService.getBoardById(task.board)

      // Get project to check permissions
      const project = await projectService.getProjectById(board.project)

      // Check if the user is authorized
      const isAdmin = req.userRole === "Admin"
      const isManager = project.manager.toString() === req.userId.toString()
      const isMember = project.members.some((member) => member.toString() === req.userId.toString())
      const isAssignee = task.assignees.some((assignee) => assignee.toString() === req.userId.toString())

      if (!isAdmin && !isManager && !isMember && !isAssignee) {
        return ApiResponse.error(res, "Unauthorized to update this task", 403)
      }

      // Inside the updateTask method, before updating the task
      console.log("Updating task with data:", req.body)
      console.log("Current assignees:", task.assignees)
      console.log("New assignees:", req.body.assignees)

      const updatedTask = await taskService.updateTask(taskId, req.body, req.userId)

      // After updating the task
      console.log("Updated task:", updatedTask)

      return ApiResponse.success(res, "Task updated successfully", { task: updatedTask })
    } catch (error) {
      logger.error(`Error updating task: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Task not found" ? "Task not found" : "Error updating task",
        error.message === "Task not found" ? 404 : 500,
      )
    }
  }

  /**
   * Delete a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteTask(req, res) {
    try {
      const { taskId } = req.params

      // Get task to check permissions
      const task = await taskService.getTaskById(taskId)
      if (!task) {
        return ApiResponse.error(res, "Task not found", 404)
      }

      // Get board to check permissions
      const board = await boardService.getBoardById(task.board)

      // Get project to check permissions
      const project = await projectService.getProjectById(board.project)

      // Check if the user is authorized
      const isAdmin = req.userRole === "Admin"
      const isManager = project.manager.toString() === req.userId.toString()

      if (!isAdmin && !isManager) {
        return ApiResponse.error(res, "Unauthorized to delete this task", 403)
      }

      await taskService.deleteTask(taskId, req.userId)
      return ApiResponse.success(res, "Task deleted successfully")
    } catch (error) {
      logger.error(`Error deleting task: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Task not found" ? "Task not found" : "Error deleting task",
        error.message === "Task not found" ? 404 : 500,
      )
    }
  }

  /**
   * Move a task to another board
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async moveTask(req, res) {
    try {
      const { taskId } = req.params
      const { targetBoard } = req.body

      if (!targetBoard) {
        return ApiResponse.error(res, "Target board is required", 400)
      }

      // Get task to check permissions
      const task = await taskService.getTaskById(taskId)
      if (!task) {
        return ApiResponse.error(res, "Task not found", 404)
      }

      // Get source board to check permissions
      const sourceBoard = await boardService.getBoardById(task.board)

      // Get target board to check permissions
      const targetBoardDoc = await boardService.getBoardById(targetBoard)
      if (!targetBoardDoc) {
        return ApiResponse.error(res, "Target board not found", 404)
      }

      // Get projects to check permissions
      const sourceProject = await projectService.getProjectById(sourceBoard.project)
      const targetProject = await projectService.getProjectById(targetBoardDoc.project)

      // Check if both boards belong to the same project
      if (sourceBoard.project.toString() !== targetBoardDoc.project.toString()) {
        return ApiResponse.error(res, "Cannot move task to a board in a different project", 400)
      }

      // Check if the user is authorized
      const isAdmin = req.userRole === "Admin"
      const isManager = sourceProject.manager.toString() === req.userId.toString()
      const isMember = sourceProject.members.some((member) => member.toString() === req.userId.toString())

      if (!isAdmin && !isManager && !isMember) {
        return ApiResponse.error(res, "Unauthorized to move this task", 403)
      }

      const movedTask = await taskService.moveTask(taskId, targetBoard, req.userId)
      return ApiResponse.success(res, "Task moved successfully", { task: movedTask })
    } catch (error) {
      logger.error(`Error moving task: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Task not found" ? "Task not found" : "Error moving task",
        error.message === "Task not found" ? 404 : 500,
      )
    }
  }

  /**
   * Reorder tasks within a board
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async reorderTasks(req, res) {
    try {
      const { boardId } = req.params
      const { tasks } = req.body

      if (!Array.isArray(tasks)) {
        return ApiResponse.error(res, "Tasks must be an array", 400)
      }

      // Get board to check permissions
      const board = await boardService.getBoardById(boardId)
      if (!board) {
        return ApiResponse.error(res, "Board not found", 404)
      }

      // Get project to check permissions
      const project = await projectService.getProjectById(board.project)

      // Check if the user is authorized
      const isAdmin = req.userRole === "Admin"
      const isManager = project.manager.toString() === req.userId.toString()
      const isMember = project.members.some((member) => member.toString() === req.userId.toString())

      if (!isAdmin && !isManager && !isMember) {
        return ApiResponse.error(res, "Unauthorized to reorder tasks in this board", 403)
      }

      await taskService.reorderTasks(boardId, tasks, req.userId)
      return ApiResponse.success(res, "Tasks reordered successfully")
    } catch (error) {
      logger.error(`Error reordering tasks: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Board not found" ? "Board not found" : "Error reordering tasks",
        error.message === "Board not found" ? 404 : 500,
      )
    }
  }

  /**
   * Get task statistics for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTaskStatsByProject(req, res) {
    try {
      const { projectId } = req.params

      // Get project to check permissions
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        return ApiResponse.error(res, "Project not found", 404)
      }

      // Check if the user is authorized
      const isAdmin = req.userRole === "Admin"
      const isManager = project.manager.toString() === req.userId.toString()
      const isMember = project.members.some((member) => member.toString() === req.userId.toString())

      if (!isAdmin && !isManager && !isMember) {
        return ApiResponse.error(res, "Unauthorized to view task statistics for this project", 403)
      }

      const stats = await taskService.getTaskStatsByProject(projectId)
      return ApiResponse.success(res, "Task statistics retrieved successfully", { stats })
    } catch (error) {
      logger.error(`Error getting task statistics: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Project not found" ? "Project not found" : "Error retrieving task statistics",
        error.message === "Project not found" ? 404 : 500,
      )
    }
  }
}

module.exports = new TaskController()
