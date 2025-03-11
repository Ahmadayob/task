const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const {Server} = require("socket.io");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET","POST"],
        allowedHeaders: ["Authorization"],
        credentials: true
    },
    transports: ["websocket"],
    allowEIO3: true,
    pingInterval: 25000,
    pingTimeout: 5000,
});

// Force WebSocket to listen on the correct network interface
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

//Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self' ws://localhost:3001");
    next();
});


//Real-time Notification System (WebSocet Event)
io.on("connection", (socket) => {
    console.log(`New WebSocket Connection: ${socket.id}`);

    socket.on("join", (userId) => {
        console.log(`👤 User joined: ${userId}`);
        socket.join(userId);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

app.get("/", (req, res) => {
    res.send("✅ WebSocket Server Running!");
});



//Routes
const authRoutes = require("./routes/auth");
app.use('/api/auth', authRoutes);

const taskRoutes = require('./routes/tasks')(io);
app.use('/api/boards', taskRoutes); // or api/boards for some tests FOR NOW ONLY

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const teamRoutes = require('./routes/teams');
app.use('/api/teams', teamRoutes);

const projectRoutes = require('./routes/projects');
app.use('/api/projects', projectRoutes);

const boardRoutes = require('./routes/boards');
app.use('/api/boards', boardRoutes);

const subtaskRoutes = require('./routes/subtasks');
app.use('/api/tasks', subtaskRoutes); // or api/tasks for

const notificationRoutes = require('./routes/notifications');
app.use("/api/notifications", notificationRoutes);

const activityLogRoutes = require("./routes/activityLog"); 
app.use("/api/activity-logs", activityLogRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
   .catch((err) => console.error('MongoDB connection error:', err));

// Start Server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));