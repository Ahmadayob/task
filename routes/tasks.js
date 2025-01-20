const express = require('express');
const { verifyToken}= require('../middleware/auth');

const router = express.Router();

router.get('/',verifyToken ,async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks"});
    }
  });

module.exports = router;