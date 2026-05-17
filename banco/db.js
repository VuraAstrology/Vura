const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'autorack.proxy.rlwy.net',
  port: 15355, // porta da Railway
  user: 'root',        
  password: 'VPfXIATBSObhpzlCcmGihIsetiYACQny',        
  database: 'Vura',
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
      rejectUnauthorized: false
  }
});

module.exports = pool;