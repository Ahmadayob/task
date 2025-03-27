// User routes
const express = require('express');
const userController = require('../controllers/user.controller');
const { validate } = require('../middleware/validation.middleware');
const { userValidation } = require('../utils/validators');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all users (admin only)
router.get('/', verifyToken, verifyAdmin, userController.getAllUsers);

// Get current user profile
router.get('/me', verifyToken, userController.getCurrentUser);

// Get user by ID
router.get('/:id', verifyToken, userController.getUserById);

// Update user
router.put('/:id', verifyToken, validate(userValidation.update), userController.updateUser);

// Delete user (admin only)
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser);

// Change user role (admin only)
router.patch('/:id/role', verifyToken, verifyAdmin, userController.changeUserRole);

module.exports = router;