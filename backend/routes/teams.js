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

router.get('/', verifyToken, async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: "Error fetching teams", details: error.message});
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {  
        const { id } = req.params;
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ error: 'Team not found'});
        }
        res.json(team);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: "Error fetching team", details: error.message});
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, members } = req.body;

        const team = await Team.findByIdAndUpdate(id, { name, description, members }, { new: true });
        if (!team) {
            return res.status(404).json({ error: 'Team not found'});
        }
        res.json(team);
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: "Error updating team", details: error.message});
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findByIdAndDelete(id);
        if (!team) {
            return res.status(404).json({ error: 'Team not found'});
        }
        res.json({ message: 'Team deleted'});
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ error: "Error deleting team", details: error.message});
    }
});


module.exports = router;