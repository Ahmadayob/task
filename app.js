const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

//Middleware
app.use(cors());
app.use(express.json());

//Routes
const authRoutes = require("./routes/auth");
app.use('/api/auth', authRoutes);

const taskRoutes = require("./routes/tasks");
app.use('/api/tasks', taskRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const teamRoutes = require('./routes/teams');
app.use('/api/teams', teamRoutes);

const projectRoutes = require('./routes/projects');
app.use('/api/projects', projectRoutes);

const boardRoutes = require('./routes/boards');
app.use('/api/projects', boardRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
   .catch((err) => console.error('MongoDB connection error:', err));


// Start Server
app.listen(PORT, () => console.log('Server running on port ${PORT}'));