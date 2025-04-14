const express = require('express');
const router = express.Router();
const searchService = require('../services/search.service');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all routes in this router
router.use(authMiddleware.verifyToken);

/**
 * @route GET /api/search
 * @desc Search across tasks, boards, and projects
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const results = await searchService.search(req.user.id, query);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 