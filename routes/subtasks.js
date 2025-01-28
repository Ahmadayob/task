const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Task = require('../models/task');
const subtask = require('../models/subtask');

const router = express.Router();

//Create a new subtask and embed it in the task
router.post('/:taskId/subtasks', verifyToken, async (req, res) => {
    try {
        const {taskId} = req.params;
        const {title, deadline}= req.body;

        //Validate the tasl exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Tasks not found'});
        }

        // Add the subtask to the task's subtasks array
        const subtask = {
            title, 
            isCompleted: false, 
            deadline,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        task.subtasks.push(subtask);
        await task.save();

        res.status(201).json({ message: 'Subtask created successfully', subtask});
    } catch (error) {
        console.error('Error creating subtask:', error);
        res.status(500).json({ error: 'Error creating subtask', detailes: error.message});
    }
})

//Get All subtasks for a task 
router.get('/:taskId/subtasks', verifyToken, async (req, res) =>{
    try {
        const {taskId}= req.params;

        //find the task and return it's subtask
        const task= await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ subtask: task.subtasks });
    } catch (error) {
        console.error('Error fetching subtasks', error);
        res.status(500).json({ error: 'Error fetching subtasks', detailes: error.message});
    }
})

module.exports = router;