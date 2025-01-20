const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    title: {type: String, required: true},
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true},
}, {timestamps: true});

module.exports = mongoose.model('Board', boardSchema);