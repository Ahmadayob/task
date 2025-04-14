const User = require("../models/user.model")
const bcrypt = require("bcryptjs")

// Get all users (admin and project managers)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -__v -createdAt -updatedAt")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    console.log("getCurrentUser called")
    console.log("req.user:", req.user)

    // Check if req.user exists
    if (!req.user) {
      console.log("req.user is undefined")
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      })
    }

    // Check if req.user.id exists
    if (!req.user.id && !req.user._id) {
      console.log("Neither req.user.id nor req.user._id exists")
      return res.status(500).json({
        success: false,
        message: "User ID not found in token",
      })
    }

    // Use either id or _id, whichever is available
    const userId = req.user.id || req.user._id
    console.log("Looking up user with ID:", userId)

    const user = await User.findById(userId).select("-password")
    console.log("User found:", user ? "Yes" : "No")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    })
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    res.status(500).json({
      success: false,
      message: "Error retrieving user profile",
    })
  }
}

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    })
  } catch (error) {
    console.error("Error in getUserById:", error)
    res.status(500).json({
      success: false,
      message: "Error retrieving user",
    })
  }
}

// Update user
exports.updateUser = async (req, res) => {
  try {
    // Get data to update
    const { name, email, profilePicture, contactInfo } = req.body

    // Check if user exists
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check permission - only allow users to update their own profile or admin
    if (req.user.id !== req.params.id && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user",
      })
    }

    // Update fields
    if (name) user.name = name
    if (email) user.email = email
    if (profilePicture !== undefined) user.profilePicture = profilePicture

    // Update contactInfo if provided
    if (contactInfo) {
      user.contactInfo = {
        ...user.contactInfo,
        ...contactInfo,
      }
    }

    await user.save()

    // Return updated user
    const updatedUser = await User.findById(req.params.id).select("-password")

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
      },
    })
  } catch (error) {
    console.error("Error in updateUser:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user",
    })
  }
}

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    await user.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    console.error("Error in deleteUser:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    })
  }
}

// Change user role (admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body

    // Validate role
    const validRoles = ["Admin", "Project Manager", "Team Member"]
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    user.role = role
    await user.save()

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error("Error in changeUserRole:", error)
    res.status(500).json({
      success: false,
      message: "Error changing user role",
    })
  }
}

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      })
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Set and hash new password
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Error in changePassword:", error)
    res.status(500).json({
      success: false,
      message: "Error changing password",
    })
  }
}

// Add this method to support the Flutter app's endpoint
exports.updateCurrentUser = async (req, res) => {
  try {
    // Get data to update
    const { name, profilePicture, contactInfo } = req.body

    // Check if user exists
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update fields
    if (name) user.name = name
    if (profilePicture !== undefined) user.profilePicture = profilePicture

    // Update contactInfo if provided
    if (contactInfo) {
      user.contactInfo = {
        ...user.contactInfo,
        ...contactInfo,
      }
    }

    await user.save()

    // Return updated user
    const updatedUser = await User.findById(req.user.id).select("-password")

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
      },
    })
  } catch (error) {
    console.error("Error in updateCurrentUser:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user profile",
    })
  }
}

/**
 * Search users by email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.searchUsersByEmail = async (req, res) => {
  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for search",
      })
    }

    // Find users whose email contains the search string (case insensitive)
    const users = await User.find({
      email: { $regex: email, $options: "i" },
    })
      .select("-password")
      .limit(10)

    // Don't include the current user in the results
    const filteredUsers = users.filter((user) => user._id.toString() !== req.user.id)

    res.status(200).json({
      success: true,
      data: { users: filteredUsers },
    })
  } catch (error) {
    console.error(`Error searching users by email: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Error searching users",
    })
  }
}
