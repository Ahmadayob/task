const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // Reference to Project model
}, { timestamps: true });

module.exports = mongoose.models.Board || mongoose.model('Board', boardSchema);
