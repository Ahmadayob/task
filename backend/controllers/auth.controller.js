const User = require("../models/user.model") // Import the User model
const jwt = require("jsonwebtoken") // Import the jsonwebtoken library
const authService = require("../services/auth.service") // Import authService
const ApiResponse = require("../utils/ApiResponse") // Import ApiResponse
const logger = require("../utils/logger") // Import logger

// Auth controller
class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const { user, token } = await authService.register(req.body)
      return ApiResponse.success(res, "User registered successfully", { user, token }, 201)
    } catch (error) {
      logger.error(`Registration error: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "User with this email already exists"
          ? "User with this email already exists"
          : "Error registering user",
        error.message === "User with this email already exists" ? 400 : 500,
      )
    }
  }

  /**
   * Login a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { email, password } = req.body
      const { user, token } = await authService.login(email, password)

      return ApiResponse.success(res, "Login successful", { user, token })
    } catch (error) {
      logger.error(`Login error: ${error.message}`)
      return ApiResponse.error(
        res,
        error.message === "Invalid email or password" || error.message === "Account is deactivated"
          ? error.message
          : "Error logging in",
        error.message === "Invalid email or password" || error.message === "Account is deactivated" ? 401 : 500,
      )
    }
  }

  /**
   * Logout a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      // JWT is stateless, so we don't need to do anything server-side
      // The client should remove the token from storage

      return ApiResponse.success(res, "Logged out successfully")
    } catch (error) {
      logger.error(`Logout error: ${error.message}`)
      return ApiResponse.error(res, "Error logging out", 500)
    }
  }
}

module.exports = new AuthController()

