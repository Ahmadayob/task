// Environment variables configuration
require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ahmad_TaskManagement',
  JWT_SECRET: process.env.JWT_SECRET || 'd32309f1301acecf562eaf46d6bf4c1f1880f042b3556bba98152b4068a78334',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 30,
};
