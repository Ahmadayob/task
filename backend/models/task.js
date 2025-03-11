const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    deadline: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
    title: {type: String, require: true},
    description: String,
    board: {type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true},
    assignees: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    deadline: Date,
    status: {type: String, enum:['To-Do', 'In Progress', 'Completed'], default: 'To-Do'},
    attachments: [{ type: String }],
    subtasks: [
       subtaskSchema
    ],
}, {timestamps: true});

module.exports = mongoose.model('Tasks', taskSchema);