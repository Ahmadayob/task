// Server entry point
const http = require("http")
const { Server } = require("socket.io")
const app = require("./app")
const connectDB = require("./config/db")
const { PORT } = require("./config/env")
const logger = require("./utils/logger")

// Connect to MongoDB
connectDB()

// Create HTTP server
const server = http.createServer(app)

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true,
  },
  transports: ["websocket"],
  pingInterval: 25000,
  pingTimeout: 5000,
})

// Socket.io event handlers
io.on("connection", (socket) => {
  logger.info(`New WebSocket connection: ${socket.id}`)

  socket.on("join", (userId) => {
    logger.info(`User joined: ${userId}`)
    socket.join(userId)
  })

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`)
  })
})

// Make io available to the rest of the app
app.set("io", io)

// Start server
server.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`)
  // Close server & exit process
  server.close(() => process.exit(1))
})

