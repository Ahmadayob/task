const mongoose = require("mongoose");

const subtaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    isCompleted: { type: Boolean, default: false },
    deadline: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subtask", subtaskSchema);
