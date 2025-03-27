// Project routes
const express = require('express');
const projectController = require('../controllers/project.controller');
const { validate } = require('../middleware/validation.middleware');
const { projectValidation } = require('../utils/validators');
const { verifyToken, verifyProjectManager } = require('../middleware/auth.middleware');

const router = express.Router();

// Create a new project (project manager or admin only)
router.post('/', verifyToken, verifyProjectManager, validate(projectValidation.create), projectController.createProject);

// Get all projects
router.get('/', verifyToken, projectController.getAllProjects);

// Get project by ID
router.get('/:id', verifyToken, projectController.getProjectById);

// Update project
router.put('/:id', verifyToken, validate(projectValidation.update), projectController.updateProject);

// Delete project
router.delete('/:id', verifyToken, projectController.deleteProject);

module.exports = router;