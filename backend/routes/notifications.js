const express = require("express");
const { verifyToken }= require("../middleware/auth");
const Notification = require("../models/notification");

 const router = express.Router();

 //Create a new notification
 router.post('/', verifyToken, async (req, res) =>{
    try {
        const { user, type, message }= req.body;

        const notification = new Notification({
            user,
            type,
            message,
        });

        await notification.save();

        res.status(201).json({ message: "Notification created", notification});
    } catch (error) {
        console.error("Error creating notification", error);
        res.status(500).json({ error: " Error creating notification", details: error.message});
    }
 });

 // Get notifications for the logged-in user
router.get("/", verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Error fetching notifications", details: error.message });
    }
});

 // Get all notifications for a user
 router.get('/:userId', verifyToken, async (req, res) =>{
    try {
        const {userId} = req.params;
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1});

        res.json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Error fetching notifications", details: error.message });
    }
 });

//Mark a notification as read
router.put("/:notificationId", verifyToken, async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Error updating notification", details: error.message });
    }
});

// Delete a notification
router.delete("/:notificationId", verifyToken, async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndDelete(notificationId);
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Error deleting notification", details: error.message });
    }
});

module.exports = router;