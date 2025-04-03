const express = require("express")
const router = express.Router()
const projectController = require("../controllers/project.controller")
const { verifyToken } = require("../middleware/auth.middleware")
const {validateProject} = require("../middleware/validation.middleware")


// Get all projects for the authenticated user
router.get("/", verifyToken, projectController.getAllProjects)

// Get project by ID
router.get("/:projectId", verifyToken, projectController.getProjectById)

// Create a new project
router.post("/", verifyToken, validateProject, projectController.createProject)

// Update a project
router.put("/:projectId", verifyToken, projectController.updateProject)

// Delete a project
router.delete("/:projectId", verifyToken, projectController.deleteProject)

// Add a member to a project
router.post("/:projectId/members", verifyToken, projectController.addMember)

// Remove a member from a project
router.delete("/:projectId/members/:userId", verifyToken, projectController.removeMember)

// Get project statistics
router.get("/:projectId/stats", verifyToken, projectController.getProjectStats)

module.exports = router

