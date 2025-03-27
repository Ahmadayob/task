// Subtask routes
const express = require('express');
const subtaskController = require('../controllers/subtask.controller');
const { validate } = require('../middleware/validation.middleware');
const { subtaskValidation } = require('../utils/validators');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Create a new subtask
router.post('/task/:taskId', verifyToken, validate(subtaskValidation.create), subtaskController.createSubtask);

// Get all subtasks for a task
router.get('/task/:taskId', verifyToken, subtaskController.getSubtasksByTask);

// Get subtask by ID
router.get('/:id', verifyToken, subtaskController.getSubtaskById);

// Update subtask
router.put('/:id', verifyToken, validate(subtaskValidation.update), subtaskController.updateSubtask);

// Delete subtask
router.delete('/:id', verifyToken, subtaskController.deleteSubtask);

// Reorder subtasks
router.post('/task/:taskId/reorder', verifyToken, subtaskController.reorderSubtasks);

module.exports = router;