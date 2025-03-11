const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // Reference to Project model
  tasks: [{
    title: String,
    descriotion: String,
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    deadline: Date,
    status: {type: String, enum: ['To-Do', 'In Progress', 'Completed'], default: 'To-Do'},
    attachments: [String],
    createdAt: Date,
    updatedAt: Date,
  },
],
}, { timestamps: true });

module.exports = mongoose.models.Board || mongoose.model('Board', boardSchema);
