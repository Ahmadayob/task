// Database connection
const mongoose = require("mongoose")
const { MONGO_URI } = require("./env")
const logger = require("../utils/logger")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      
    })

    logger.info(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB

