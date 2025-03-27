// Notification routes
const express = require("express")
const notificationController = require("../controllers/notification.controller")
const { verifyToken } = require("../middleware/auth.middleware")

const router = express.Router()

// Get notifications for the current user
router.get("/", verifyToken, notificationController.getUserNotifications)

// Mark notification as read
router.patch("/:id/read", verifyToken, notificationController.markNotificationAsRead)

// Mark all notifications as read
router.patch("/read-all", verifyToken, notificationController.markAllNotificationsAsRead)

// Delete notification
router.delete("/:id", verifyToken, notificationController.deleteNotification)

// Delete all notifications
router.delete("/", verifyToken, notificationController.deleteAllNotifications)

module.exports = router

