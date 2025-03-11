const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deadline: Date,
  boards: [
    {
      title: String,
      project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      createdAt: Date,
      updatedAt: Date,
    },
 ], 
}, { timestamps: true });

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);
