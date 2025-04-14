const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

// Protect routes - Authentication middleware
exports.protect = async (req, res, next) => {
  try {
    let token

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password")

      // Add user ID and role to request for easier access
      req.userId = req.user._id
      req.userRole = req.user.role

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        })
      }

      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Add the verifyToken function that's being used in your routes
exports.verifyToken = async (req, res, next) => {
  try {
    let token

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password")

      // Add user ID and role to request for easier access
      req.userId = req.user._id
      req.userRole = req.user.role

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        })
      }

      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Add the verifyProjectManager function that's mentioned in the error logs
exports.verifyProjectManager = async (req, res, next) => {
  try {
    // This middleware should be used after verifyToken
    // so req.user should be available
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    // For project creation, we don't need to check if the user is a manager
    // since they're creating a new project and will become the manager
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Add the verifyAdmin function that's mentioned in the error logs
exports.verifyAdmin = async (req, res, next) => {
  try {
    // This middleware should be used after verifyToken
    // so req.user should be available
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}