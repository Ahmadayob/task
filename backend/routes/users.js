const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// Get all users (Admin only)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

module.exports = router;
