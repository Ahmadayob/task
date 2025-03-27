// Team model
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Team', teamSchema);