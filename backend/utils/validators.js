// Validation schemas
const Joi = require("joi")

// User validation schemas
const userValidation = {
  register: Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(30),
    role: Joi.string().valid("Admin", "Project Manager", "Team Member").default("Team Member"),
  }),
  login: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6).max(30),
  }),
  update: Joi.object({
    name: Joi.string().min(2).max(50),
    profilePicture: Joi.string().uri().allow(""),
    contactInfo: Joi.object({
      phone: Joi.string().allow(""),
      location: Joi.string().allow(""),
    }),
  }),
  changeRole: Joi.object({
    role: Joi.string().valid("Admin", "Project Manager", "Team Member").required(),
  }),
}

// Project validation schemas
const projectValidation = {
  create: Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().allow(""),
    deadline: Joi.date().iso().allow(null),
    status: Joi.string().valid("Planning", "In Progress", "On Hold", "Completed", "Cancelled").default("Planning"),
    members: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .default([]),
  }),
  update: Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().allow(""),
    deadline: Joi.date().iso().allow(null),
    status: Joi.string().valid("Planning", "In Progress", "On Hold", "Completed", "Cancelled"),
    members: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
  }),
}

// Board validation schemas
const boardValidation = {
  create: Joi.object({
    title: Joi.string().required().min(1).max(50),
    project: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/),
  }),
  update: Joi.object({
    title: Joi.string().min(1).max(50),
  }),
}

// Task validation schemas
const taskValidation = {
  create: Joi.object({
    title: Joi.string().required().min(1).max(100),
    description: Joi.string().allow(""),
    board: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/),
    assignees: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    deadline: Joi.date().iso().allow(null),
    priority: Joi.string().valid("Low", "Medium", "High", "Urgent").default("Medium"),
    status: Joi.string().valid("To Do", "In Progress", "In Review", "Done").default("To Do"),
  }),
  update: Joi.object({
    title: Joi.string().min(1).max(100),
    description: Joi.string().allow(""),
    assignees: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    deadline: Joi.date().iso().allow(null),
    priority: Joi.string().valid("Low", "Medium", "High", "Urgent"),
    status: Joi.string().valid("To Do", "In Progress", "In Review", "Done"),
  }),
}

// Subtask validation schemas
const subtaskValidation = {
  create: Joi.object({
    title: Joi.string().required().min(1).max(100),
    deadline: Joi.date().iso().allow(null),
  }),
  update: Joi.object({
    title: Joi.string().min(1).max(100),
    isCompleted: Joi.boolean(),
    deadline: Joi.date().iso().allow(null),
  }),
}

// Team validation schemas
const teamValidation = {
  addMember: Joi.object({
    userId: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/),
    role: Joi.string().valid("Viewer", "Editor", "Contributor", "Admin").default("Viewer"),
  }),
  updateRole: Joi.object({
    role: Joi.string().required().valid("Viewer", "Editor", "Contributor", "Admin"),
  }),
}

module.exports = {
  userValidation,
  projectValidation,
  boardValidation,
  taskValidation,
  subtaskValidation,
  teamValidation,
}

