const express = require("express");
const {verifyToken} = require("../middleware/auth");
const Project = require('../models/project');
const Board = require('../models/board');

const router = express.Router();

// Create a new board
router.post('/:projectId/boards', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;

    // Create the board
    const board = new Board({
      title,
      project: projectId,
    });

    await board.save();

    // Add the full board details to the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.boards.push({
      title: board.title,
      project: board.project,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    });

    await project.save();

    res.status(201).json({ message: 'Board created successfully', board });
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Error creating board', details: error.message });
  }
});

//Get all boards for a project
router.get('/:projectId/boards', verifyToken, async (req, res) => {
  try {
    const {projectId} = req.params;

    const boards = await Board.find({ project: projectId });
    res.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Error fetching boards', default: error.message});
  }
});

module.exports = router;