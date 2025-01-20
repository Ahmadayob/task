const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {type: String, require: true},
    description: String,
    board: {type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    deadline: Date,
    attachment: String,
}, {timestamps: true});

module.exports = mongoose.model('Tasks', taskSchema);