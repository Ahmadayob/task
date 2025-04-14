// User routes
const express = require("express")
const userController = require("../controllers/user.controller")
const { validate } = require("../middleware/validation.middleware")
const { userValidation } = require("../utils/validators")
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware")

const router = express.Router()

// Get all users (admin and project managers)
router.get("/", verifyToken, userController.getAllUsers)

// Get current user profile
router.get("/me", verifyToken, userController.getCurrentUser)

// Search users by email
router.get("/search", verifyToken, userController.searchUsersByEmail)

// Get user by ID
router.get("/:id", verifyToken, userController.getUserById)

// Update user
router.put("/:id", verifyToken, validate(userValidation.update), userController.updateUser)

// Delete user (admin only)
router.delete("/:id", verifyToken, verifyAdmin, userController.deleteUser)

// Change user role (admin only)
router.patch("/:id/role", verifyToken, verifyAdmin, userController.changeUserRole)

// Change password
router.put("/change-password", verifyToken, userController.changePassword)

module.exports = router
