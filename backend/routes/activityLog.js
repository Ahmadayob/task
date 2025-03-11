const express = require("express");
const { verifyToken } = require("../middleware/auth");
const ActivityLog = require("../models/activityLog");

const router = express.Router();

// Fetch all activity logs for a user
router.get("/", verifyToken, async (req, res) => {
    try {
        const logs = await ActivityLog.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ logs });
    } catch (error) {
        console.error("Error fetching activity logs:", error);
        res.status(500).json({ error: "Error fetching activity logs", details: error.message });
    }
});

module.exports = router;
