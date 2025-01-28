const express = require('express');
const { verifyToken}= require('../middleware/auth');
const Board = require('../models/board');
const Task = require('../models/task');

const router = express.Router();

router.post('/:boardId/tasks', verifyToken, async (req, res) => {
    try {
        const { boardId }= req.params;
        const {title, description, assignees, deadline, attachments } = req.body;


        //check if the board exists
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ error: 'Board not found'});
        }

        //Create the task
        const task = new Task({
            title,
            description,
            board: boardId,
            assignees, 
            deadline,
            attachments,
        });

        await task.save(); // Save the task to the tasks collection

        //Add the task detailes to the board's tasks array
        board.tasks.push({
            title: task.title,
            description: task.description,
            assignees: task.assignees,
            deadline: task.deadline,
            status: task.status,
            attachments: task.attachments,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        });

        await board.save();

        res.status(201).json({ message: 'Task created successfully', task});
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Error creating task', detailes: error.message});
    }
})

router.get('/',verifyToken ,async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks"});
    }
  });

 //Get all tasks for the board
 router.get('/:boardId/tasks', verifyToken, async (req, res) =>{ 
    try {
        const { boardId }= req.params;

        //Find all tasks fr the board
        const tasks = await Task.find({ board: boardId }).populate('assignees', ' name email');

        res.json({tasks});
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Error fetching tasks', detailes: error.message})
    }
 }) 

module.exports = router;