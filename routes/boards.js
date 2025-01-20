const Board = require('../models/board');

router.post('/:projectId/boards', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;

    const board = new Board({
      title,
      project: projectId,
    });

    await board.save();
    res.status(201).json({ message: 'Board created successfully', board });
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Error creating board', details: error.message });
  }
});

module.exports = router;