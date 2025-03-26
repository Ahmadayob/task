const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Project = require('../models/project');
const Board = require('../models/board');
const Notification = require('../models/notification');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, description, members, deadline }= req.body;

        const project = new Project({
            title,
            description,
            manager: req.userId, 
            members: [req.userId, ...members],
            deadline,
        });

        await project.save();
        res.status(201).json({ message: 'Project created successufly', project });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Error creating project', details: error.message });
    }
});
module.exports = router;

router.put('/:id', verifyToken, async (req, res) => { 
    try {
        const { id } = req.params;
        const { deadline, members }= req.body;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({error: 'Project not found'});
        }

        if (String(project.manager) !== req.userId) {
            return res.status(403).json({error: 'Only the Project manager can modify the project'});
        }

        if (deadline) project.deadline = deadline;
        if (members) project.members = [...new Set([...project.members, ...members])];

        await project.save();

        for ( let userId of project.members){
            const notification = new Notification({
                user: userId,
                type: "ProjectUpdated",
                message: 'Project "${project.title" has been updated',
            });
            await notification.save();
        }
        res.json({ message: 'Project updated successfully', project});
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({error: 'Error updating project', details: error.message});
    }
})

// Get project details with populated boards
router.get('/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the project and populate the boards field
      const project = await Project.findById(id).populate('boards');
  
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      res.json({ project });
    } catch (error) {
      console.error('Error fetching project details:', error);
      res.status(500).json({ error: 'Error fetching project details', details: error.message });
    }
  });
  
  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the project and delete it
      const project = await Project.findByIdAndDelete(id);
  
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Error deleting project', details: error.message });
    }
  });

module.exports = router;