const mongoose = require("mongoose");

const notificationsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, // User receving the notification
    type: { type: String, enum: ['TaskAssigned', "ProjectUpdated", "DeadlineChange"], required: true},
    message: {type: String, required: true},
    isRead: { type: Boolean, default: false},
}, { timestamps: true });

module.exports = mongoose.model("Notifications", notificationsSchema);