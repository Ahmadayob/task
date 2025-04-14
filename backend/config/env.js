// Environment variables configuration
require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ahmad_TaskManagement',
  JWT_SECRET: process.env.JWT_SECRET || '61fe91e8871e4e9eb2e06929925210313bfa9ef6af284023ac77dfe4d02cb2a9',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '60d',
  JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 30,
};
