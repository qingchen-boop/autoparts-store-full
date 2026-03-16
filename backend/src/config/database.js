require('dotenv').config();

module.exports = {
  development: {
    database: process.env.DB_NAME || 'autoparts',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    database: process.env.DB_NAME || 'autoparts',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }
};
