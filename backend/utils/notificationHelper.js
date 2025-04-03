const Notification = require("../models/notification.model");

/**
 * Create a notification
 * @param {Object} notificationData - The notification data
 * @param {string} notificationData.recipient - The recipient user ID
 * @param {string} notificationData.sender - The sender user ID
 * @param {string} notificationData.message - The notification message
 * @param {Object} notificationData.relatedItem - The related item (optional)
 * @param {string} notificationData.relatedItem.itemId - The related item ID
 * @param {string} notificationData.relatedItem.itemType - The related item type
 * @returns {Promise<Object>} - The created notification
 */
exports.createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create({
      recipient: notificationData.recipient,
      sender: notificationData.sender,
      message: notificationData.message,
      relatedItem: notificationData.relatedItem,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification ID
 * @returns {Promise<Object>} - The updated notification
 */
exports.markNotificationAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
