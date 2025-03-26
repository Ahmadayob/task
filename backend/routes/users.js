const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// Get all users 
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Update user by ID
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, profile_Picture, contact_info } = req.body;

    const user = await User.findByIdAndUpdate(id, { name, email, profile_Picture, contact_info }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Delete user by ID
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try { 
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

module.exports = router;
