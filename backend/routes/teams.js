const express= require("express");
const { verifyToken } = require("../middleware/auth");
const Team = require("../models/team");

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, description, members } = req.body;
        console.log('Creating team with:', { name, description, members});

        const team = new Team({ name, description, members});
        await team.save();

        res.status(201).json({ message: 'Team created', team});
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: "Error creating team", details: error.message});
    }
});

module.exports = router;