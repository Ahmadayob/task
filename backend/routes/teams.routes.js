// Team routes
const express = require("express")
const teamController = require("../controllers/team.controller")
const { validate } = require("../middleware/validation.middleware")
const { teamValidation } = require("../utils/validators")
const { verifyToken, verifyProjectManager } = require("../middleware/auth.middleware")

const router = express.Router()

// Add team member to project
router.post(
  "/project/:projectId/members",
  verifyToken,
  validate(teamValidation.addMember),
  teamController.addTeamMember,
)

// Remove team member from project
router.delete("/project/:projectId/members/:userId", verifyToken, teamController.removeTeamMember)

// Update team member role
router.patch(
  "/project/:projectId/members/:userId/role",
  verifyToken,
  validate(teamValidation.updateRole),
  teamController.updateTeamMemberRole,
)

// Get team members for a project
router.get("/project/:projectId/members", verifyToken, teamController.getTeamMembers)

module.exports = router

