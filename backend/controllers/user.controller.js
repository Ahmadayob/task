// User controller
const userService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

class UserController {


// Get user profile
getUserProfile = async (req, res) => {
  try {
    // The user is already available from the auth middleware
    const user = await User.findById(req.user._id).select("-password")

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
    console.error("Error in getUserProfile:", error)
    res.status(500).json({
      success: false,
      message: "Error retrieving user",
    })
  }
}

// Update user profile
updateUserProfile = async (req, res) => {
  try {
    const { name, profilePicture, contactInfo } = req.body

    // Find the user
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update fields
    if (name) user.name = name
    if (profilePicture !== undefined) user.profilePicture = profilePicture
    if (contactInfo) {
      user.contactInfo = {
        ...user.contactInfo,
        ...contactInfo,
      }
    }

    // Save the updated user
    await user.save()

    // Return the updated user without password
    const updatedUser = await User.findById(user._id).select("-password")

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
      },
    })
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user profile",
    })
  }
}

  /**
   * Get all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllUsers(req, res) {
    try {
      const { page, limit, sortBy, sortOrder, search } = req.query;
      
      // Build filter based on search query
      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      const options = { page, limit, sortBy, sortOrder };
      const result = await userService.getAllUsers(filter, options);
      
      return ApiResponse.success(res, 'Users retrieved successfully', result);
    } catch (error) {
      logger.error(`Error getting users: ${error.message}`);
      return ApiResponse.error(res, 'Error retrieving users', 500);
    }
  }
  
  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      return ApiResponse.success(res, 'User retrieved successfully', { user });
    } catch (error) {
      logger.error(`Error getting user by ID: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'User not found' ? 'User not found' : 'Error retrieving user', 
        error.message === 'User not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentUser(req, res) {
    try {
      const user = await userService.getUserById(req.userId);
      
      return ApiResponse.success(res, 'User profile retrieved successfully', { user });
    } catch (error) {
      logger.error(`Error getting current user: ${error.message}`);
      return ApiResponse.error(res, 'Error retrieving user profile', 500);
    }
  }
  
  /**
   * Update user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user is updating their own profile or is an admin
      if (id !== req.userId && req.userRole !== 'Admin') {
        return ApiResponse.error(res, 'Unauthorized to update this user', 403);
      }
      
      const user = await userService.updateUser(id, req.body);
      
      return ApiResponse.success(res, 'User updated successfully', { user });
    } catch (error) {
      logger.error(`Error updating user: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'User not found' ? 'User not found' : 'Error updating user', 
        error.message === 'User not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Delete user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      
      return ApiResponse.success(res, 'User deleted successfully');
    } catch (error) {
      logger.error(`Error deleting user: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'User not found' ? 'User not found' : 'Error deleting user', 
        error.message === 'User not found' ? 404 : 500
      );
    }
  }
  
  /**
   * Change user role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changeUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!role) {
        return ApiResponse.error(res, 'Role is required', 400);
      }
      
      const user = await userService.changeUserRole(id, role);
      
      return ApiResponse.success(res, 'User role updated successfully', { user });
    } catch (error) {
      logger.error(`Error changing user role: ${error.message}`);
      return ApiResponse.error(
        res, 
        error.message === 'User not found' ? 'User not found' : 'Error changing user role', 
        error.message === 'User not found' ? 404 : 500
      );
    }
  }

  // In user.controller.js
changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select("+password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    
    // Set and hash new password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password"
    });
  }
};
}

module.exports = new UserController();