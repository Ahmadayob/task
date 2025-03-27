// Auth routes
const express = require('express');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');
const { userValidation } = require('../utils/validators');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Register a new user
router.post('/register', validate(userValidation.register), authController.register);

// Login a user
router.post('/login', validate(userValidation.login), authController.login);

// Logout a user
router.post('/logout', verifyToken, authController.logout);

module.exports = router;