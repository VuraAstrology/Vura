const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'zephyr.proxy.rlwy.net',
  port: 21419, // porta da Railway
  user: 'root',        
  password: 'GeBXgvKPgPRQErWIGvQzqSYgJkjOLkvj',        
  database: 'Vura',
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
      rejectUnauthorized: false
  }
});

module.exports = pool;