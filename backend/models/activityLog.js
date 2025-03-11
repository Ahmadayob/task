const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who performed the action
    action: { type: String, required: true }, // Example: "Created Task", "Deleted Project"
    details: { type: String }, // Additional information
    relatedObject: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the related task/project
    objectType: { type: String, required: true, enum: ["Task", "Project", "Board", "Subtask"] }, // What kind of object was changed
    createdAt: { type: Date, default: Date.now }
}, { collection: "activityLog" }); 

module.exports = mongoose.model("ActivityLog", activityLogSchema);
