const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true},
    description: String, 
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, 
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    deadline: Date,
}, {timestamps: true});

module.exports = mongoose.model('Project', projectSchema);