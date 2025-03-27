// User service
const User = require('../models/user.model');
const ActivityLog = require('../models/activityLog.model');
const logger = require('../utils/logger');

class UserService {
  /**
   * Get all users
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Object} - Users and pagination info
   */
  async getAllUsers(filter = {}, options = {}) {
    try {
      const page = parseInt(options.page, 10) || 1;
      const limit = parseInt(options.limit, 10) || 10;
      const skip = (page - 1) * limit;
      
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
      
      // Build query
      let query = User.find(filter);
      
      // Apply pagination
      query = query.skip(skip).limit(limit);
      
      // Apply sorting
      query = query.sort({ [sortBy]: sortOrder });
      
      // Execute query
      const users = await query;
      
      // Get total count
      const total = await User.countDocuments(filter);
      
      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error getting all users: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object} - User object
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      logger.error(`Error getting user by ID: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} - Updated user
   */
  async updateUser(userId, updateData) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Create activity log
      await ActivityLog.create({
        user: userId,
        action: 'User updated',
        details: `User ${user.name} was updated`,
        relatedItem: {
          itemId: userId,
          itemType: 'User'
        }
      });
      
      return updatedUser;
    } catch (error) {
      logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Change user role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @param {string} adminId - Admin user ID
   * @returns {Object} - Updated user
   */
  async changeUserRole(userId, role, adminId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update role
      user.role = role;
      await user.save();
      
      // Create activity log
      await ActivityLog.create({
        user: adminId,
        action: 'User role changed',
        details: `User ${user.name}'s role was changed to ${role}`,
        relatedItem: {
          itemId: userId,
          itemType: 'User'
        }
      });
      
      return user;
    } catch (error) {
      logger.error(`Error changing user role: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Delete user
   * @param {string} userId - User ID
   * @param {string} adminId - Admin user ID
   * @returns {boolean} - Success status
   */
  async deleteUser(userId, adminId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Store user name for activity log
      const userName = user.name;
      
      // Delete user
      await User.findByIdAndDelete(userId);
      
      // Create activity log
      await ActivityLog.create({
        user: adminId,
        action: 'User deleted',
        details: `User ${userName} was deleted`,
        relatedItem: {
          itemId: userId,
          itemType: 'User'
        }
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new UserService();
