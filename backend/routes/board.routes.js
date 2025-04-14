// Board routes
const express = require("express")
const boardController = require("../controllers/board.controller")
const { validate } = require("../middleware/validation.middleware")
const { boardValidation } = require("../utils/validators")
const { verifyToken } = require("../middleware/auth.middleware")

const router = express.Router()

// Create a new board
router.post("/", verifyToken, validate(boardValidation.create), boardController.createBoard)

// Get all boards for a project
router.get("/project/:projectId", verifyToken, boardController.getBoardsByProject)

// Get board by ID
router.get("/:id", verifyToken, boardController.getBoardById)

// Update board
router.put("/:id", verifyToken, validate(boardValidation.update), boardController.updateBoard)

// Delete board
router.delete("/:id", verifyToken, boardController.deleteBoard)

// Reorder boards
router.patch("/project/:projectId/reorder", verifyToken, boardController.reorderBoards)

module.exports = router
