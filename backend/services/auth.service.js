// Authentication service
const User = require('../models/user.model');
const ActivityLog = require('../models/activityLog.model');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User data
   * @returns {Object} - User object and token
   */
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create user
      const user = await User.create(userData);

      // Create activity log
      await ActivityLog.create({
        user: user._id,
        action: 'User registered',
        details: `User ${user.name} registered`,
        relatedItem: {
          itemId: user._id,
          itemType: 'User'
        }
      });

      // Generate token
      const token = user.getSignedJwtToken();

      return { user, token };
    } catch (error) {
      logger.error(`Error registering user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - User object and token
   */
  async login(email, password) {
    try {
      // Check if user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Create activity log
      await ActivityLog.create({
        user: user._id,
        action: 'User logged in',
        details: `User ${user.name} logged in`,
        relatedItem: {
          itemId: user._id,
          itemType: 'User'
        }
      });

      // Generate token
      const token = user.getSignedJwtToken();

      return { user, token };
    } catch (error) {
      logger.error(`Error logging in user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {boolean} - Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Check if user exists
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Check if current password matches
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Create activity log
      await ActivityLog.create({
        user: user._id,
        action: 'Password changed',
        details: `User ${user.name} changed their password`,
        relatedItem: {
          itemId: user._id,
          itemType: 'User'
        }
      });

      return true;
    } catch (error) {
      logger.error(`Error changing password: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AuthService();
