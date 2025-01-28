const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {type: String, require: true},
    description: String,
    board: {type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true},
    assignees: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    deadline: Date,
    status: {type: String, enum:['To-Do', 'In Progress', 'Completed'], default: 'To-Do'},
    attachments: String,
    subtasks: [
        {
            title: String,
            isCompleted: {type: Boolean, defauld: false},
            deadline: Date, 
            createdAt: Date,
            updatedAt: Date,
        },
    ],
}, {timestamps: true});

module.exports = mongoose.model('Tasks', taskSchema);