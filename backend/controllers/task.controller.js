const Task = require("../models/task.model")
const Board = require("../models/board.model")
const Project = require("../models/project.model")
const User = require("../models/user.model")
const Notification = require("../models/notification.model")
const mongoose = require("mongoose")
const { createNotification } = require("../utils/notificationHelper")

// Get all tasks for the authenticated user
exports.getAllTasks = async (req, res) => {
  try {
    // Find all tasks where the user is an assignee or is the manager of the project
    const userId = req.user._id

    // First, find all projects where the user is a manager or member
    const projects = await Project.find({
      $or: [{ manager: userId }, { members: userId }],
    }).select("_id")

    const projectIds = projects.map((project) => project._id)

    // Find all boards in these projects
    const boards = await Board.find({
      project: { $in: projectIds },
    }).select("_id")

    const boardIds = boards.map((board) => board._id)

    // Find all tasks in these boards or where the user is an assignee
    const tasks = await Task.find({
      $or: [{ board: { $in: boardIds } }, { assignees: userId }],
    })
      .populate("assignees", "name email profilePicture")
      .populate({
        path: "board",
        select: "title project",
        populate: {
          path: "project",
          select: "title",
        },
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    })
  } catch (error) {
    console.error("Error getting all tasks:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get tasks",
      error: error.message,
    })
  }
}

// Get tasks by board
exports.getTasksByBoard = async (req, res) => {
  try {
    const { boardId } = req.params

    // Validate board exists
    const board = await Board.findById(boardId)
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      })
    }

    // Get tasks for the board
    const tasks = await Task.find({ board: boardId })
      .populate("assignees", "name email profilePicture")
      .sort({ order: 1 })

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    })
  } catch (error) {
    console.error("Error getting tasks by board:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get tasks",
      error: error.message,
    })
  }
}

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params

    const task = await Task.findById(taskId)
      .populate("assignees", "name email profilePicture")
      .populate({
        path: "board",
        select: "title project",
        populate: {
          path: "project",
          select: "title",
        },
      })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        task,
      },
    })
  } catch (error) {
    console.error("Error getting task by ID:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get task",
      error: error.message,
    })
  }
}

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, board, assignees, deadline, status, priority } = req.body

    // Validate board exists
    const boardExists = await Board.findById(board)
    if (!boardExists) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      })
    }

    // Get the highest order value in the board
    const highestOrderTask = await Task.findOne({ board }).sort({ order: -1 }).limit(1)

    const order = highestOrderTask ? highestOrderTask.order + 1 : 0

    // Create the task
    const task = await Task.create({
      title,
      description,
      board,
      assignees: assignees || [req.user._id], // Default to current user if no assignees
      deadline,
      status: status || "To Do",
      priority: priority || "Medium",
      order,
    })

    // Populate assignees for the response
    const populatedTask = await Task.findById(task._id).populate("assignees", "name email profilePicture")

    // Get project information for notifications
    const project = await Project.findById(boardExists.project)

    // Create notifications for assignees
    if (assignees && assignees.length > 0) {
      for (const assigneeId of assignees) {
        // Don't notify the creator if they assigned themselves
        if (assigneeId.toString() !== req.user._id.toString()) {
          await createNotification({
            recipient: assigneeId,
            sender: req.user._id,
            message: `You have been assigned to task "${title}" in board "${boardExists.title}"`,
            relatedItem: {
              itemId: task._id,
              itemType: "Task",
            },
          })
        }
      }
    }

    // Notify project manager if they're not the creator or an assignee
    if (
      project &&
      project.manager &&
      project.manager.toString() !== req.user._id.toString() &&
      (!assignees || !assignees.includes(project.manager.toString()))
    ) {
      await createNotification({
        recipient: project.manager,
        sender: req.user._id,
        message: `A new task "${title}" has been created in board "${boardExists.title}"`,
        relatedItem: {
          itemId: task._id,
          itemType: "Task",
        },
      })
    }

    res.status(201).json({
      success: true,
      data: {
        task: populatedTask,
      },
    })
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    })
  }
}

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params
    const updates = req.body

    // Find the task
    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Check if status is being updated
    const statusChanged = updates.status && updates.status !== task.status
    const oldStatus = task.status

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("assignees", "name email profilePicture")

    // If status changed to "Done", notify the project manager
    if (statusChanged && updates.status === "Done") {
      const board = await Board.findById(task.board)
      if (board) {
        const project = await Project.findById(board.project)
        if (project && project.manager) {
          await createNotification({
            recipient: project.manager,
            sender: req.user._id,
            message: `Task "${task.title}" has been marked as complete`,
            relatedItem: {
              itemId: task._id,
              itemType: "Task",
            },
          })
        }
      }
    }

    // If assignees were updated, notify new assignees
    if (updates.assignees && Array.isArray(updates.assignees)) {
      const oldAssigneeIds = task.assignees.map((a) => a.toString())
      const newAssigneeIds = updates.assignees.map((a) => a.toString())

      // Find new assignees that weren't previously assigned
      const newlyAddedAssignees = newAssigneeIds.filter((id) => !oldAssigneeIds.includes(id))

      // Notify new assignees
      for (const assigneeId of newlyAddedAssignees) {
        if (assigneeId !== req.user._id.toString()) {
          await createNotification({
            recipient: assigneeId,
            sender: req.user._id,
            message: `You have been assigned to task "${task.title}"`,
            relatedItem: {
              itemId: task._id,
              itemType: "Task",
            },
          })
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        task: updatedTask,
      },
    })
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    })
  }
}

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params

    // Find the task
    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Delete the task
    await Task.findByIdAndDelete(taskId)

    // Delete any notifications related to this task
    await Notification.deleteMany({
      "relatedItem.itemId": taskId,
      "relatedItem.itemType": "Task",
    })

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    })
  }
}

// Move a task to another board
exports.moveTask = async (req, res) => {
  try {
    const { taskId } = req.params
    const { targetBoard } = req.body

    // Validate task exists
    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Validate target board exists
    const board = await Board.findById(targetBoard)
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Target board not found",
      })
    }

    // Get the highest order value in the target board
    const highestOrderTask = await Task.findOne({ board: targetBoard }).sort({ order: -1 }).limit(1)

    const newOrder = highestOrderTask ? highestOrderTask.order + 1 : 0

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: {
          board: targetBoard,
          order: newOrder,
        },
      },
      { new: true, runValidators: true },
    ).populate("assignees", "name email profilePicture")

    res.status(200).json({
      success: true,
      data: {
        task: updatedTask,
      },
    })
  } catch (error) {
    console.error("Error moving task:", error)
    res.status(500).json({
      success: false,
      message: "Failed to move task",
      error: error.message,
    })
  }
}

// Reorder tasks within a board
exports.reorderTasks = async (req, res) => {
  try {
    const { boardId } = req.params
    const { tasks } = req.body

    // Validate board exists
    const board = await Board.findById(boardId)
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      })
    }

    // Validate tasks array
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: "Tasks must be an array",
      })
    }

    // Update each task's order
    const updateOperations = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task.id, board: boardId },
        update: { $set: { order: task.order } },
      },
    }))

    await Task.bulkWrite(updateOperations)

    res.status(200).json({
      success: true,
      message: "Tasks reordered successfully",
    })
  } catch (error) {
    console.error("Error reordering tasks:", error)
    res.status(500).json({
      success: false,
      message: "Failed to reorder tasks",
      error: error.message,
    })
  }
}

// Get task statistics for a project
exports.getTaskStatsByProject = async (req, res) => {
  try {
    const { projectId } = req.params

    // Find all boards in the project
    const boards = await Board.find({ project: projectId })
    const boardIds = boards.map((board) => board._id)

    // Get task counts by status
    const taskStats = await Task.aggregate([
      { $match: { board: { $in: boardIds } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Format the results
    const stats = {
      total: 0,
      byStatus: {},
    }

    taskStats.forEach((stat) => {
      stats.byStatus[stat._id] = stat.count
      stats.total += stat.count
    })

    res.status(200).json({
      success: true,
      data: {
        stats,
      },
    })
  } catch (error) {
    console.error("Error getting task stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get task statistics",
      error: error.message,
    })
  }
}

