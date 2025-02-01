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


// Update a subtask inside a task
router.put("/:taskId/subtasks/:subtaskId", verifyToken, async (req, res) => {
    try {
        const { taskId, subtaskId } = req.params;
        const { title, isCompleted, deadline } = req.body;

        // Ensure taskId and subtaskId exist
        if (!taskId || !subtaskId) {
            return res.status(400).json({ error: "Task ID and Subtask ID are required" });
        }

        // Find the parent task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Find the subtask inside the task's `subtasks` array
        const subtask = task.subtasks.id(subtaskId);
        if (!subtask) {
            return res.status(404).json({ error: "Subtask not found" });
        }

        // Update only the fields provided in the request
        if (title) subtask.title = title;
        if (isCompleted !== undefined) subtask.isCompleted = isCompleted;
        if (deadline) subtask.deadline = deadline;
        subtask.updatedAt = new Date();

        await task.save();

        res.json({ message: "Subtask updated successfully", subtask });
    } catch (error) {
        console.error("Error updating subtask:", error);
        res.status(500).json({ error: "Error updating subtask", details: error.message });
    }
});

// Delete a subtask inside a task
router.delete("/:taskId/subtasks/:subtaskId", verifyToken, async (req, res) => {
    try {
        const { taskId, subtaskId } = req.params;

        // Find the parent task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Find the index of the subtask and remove it
        const subtaskIndex = task.subtasks.findIndex(sub => sub._id.toString() === subtaskId);
        if (subtaskIndex === -1) {
            return res.status(404).json({ error: "Subtask not found" });
        }

        task.subtasks.splice(subtaskIndex, 1);
        await task.save();

        res.json({ message: "Subtask deleted successfully" });
    } catch (error) {
        console.error("Error deleting subtask:", error);
        res.status(500).json({ error: "Error deleting subtask", details: error.message });
    }
});



module.exports = router;