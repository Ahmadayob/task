// Activity Log routes
const express = require("express")
const activityLogController = require("../controllers/activityLog.controller")
const { verifyToken } = require("../middleware/auth.middleware")

const router = express.Router()

// Get activity logs for a project
router.get("/project/:projectId", verifyToken, activityLogController.getProjectActivityLogs)

// Get activity logs for a user
router.get("/user/:userId", verifyToken, activityLogController.getUserActivityLogs)

// Get activity logs for a specific item
router.get("/item/:itemType/:itemId", verifyToken, activityLogController.getItemActivityLogs)

module.exports = router

