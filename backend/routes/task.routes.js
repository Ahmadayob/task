// Task routes
const express = require('express');
const taskController = require('../controllers/task.controller');
const { validate } = require('../middleware/validation.middleware');
const { taskValidation } = require('../utils/validators');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Create a new task
router.post('/', verifyToken, validate(taskValidation.create), taskController.createTask);

// Get all tasks for a board
router.get('/board/:boardId',  taskController.createTask);

// Get all tasks for a board
router.get('/board/:boardId', verifyToken, taskController.getTasksByBoard);

// Get task by ID
router.get('/:id', verifyToken, taskController.getTaskById);

// Update task
router.put('/:id', verifyToken, validate(taskValidation.update), taskController.updateTask);

// Delete task
router.delete('/:id', verifyToken, taskController.deleteTask);

// Move task to another board
router.post('/:id/move', verifyToken, taskController.moveTask);

// Reorder tasks
router.post('/board/:boardId/reorder', verifyToken, taskController.reorderTasks);

module.exports = router;