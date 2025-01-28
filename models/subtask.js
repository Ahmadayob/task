const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    task: {type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true},
    deadline: Date,
    isCompleted: {type: Boolean, defauld: false},
}, {timestamps: true});

module.exports = mongoose.model('Subtask', subtaskSchema);