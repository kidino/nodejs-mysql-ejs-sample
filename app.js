// Import necessary modules
const express = require('express');
const mysql = require('mysql');
// console.log(require('dotenv').config())
const dotenv = require('dotenv').config();

// Create connection to MySQL database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

// Connect to the database
db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected');
});

// Create Express application
const app = express();

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to serve static files (Bootstrap CSS)
app.use(express.static('public'));

// Route to capture visitor data and store it in the database
app.get('/', (req, res) => {
  const { ip, headers } = req;
  const userAgent = headers['user-agent'];
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const pageVisited = '/'; // You can modify this to capture the actual page visited
  
  const sql = 'INSERT INTO access_log (visitor_ip, visit_timestamp, page_visited, user_agent) VALUES (?, ?, ?, ?)';
  const values = [ip, timestamp, pageVisited, userAgent];

  db.query(sql, values, (err, result) => {
    if (err) {
      throw err;
    }
    console.log('Visitor data inserted');
  });

  const sql2 = 'SELECT * FROM access_log ORDER BY visit_timestamp DESC LIMIT 20';

  db.query(sql2, (err, rows) => {
    if (err) {
      throw err;
    }
    res.render('last-visits', { visits: rows });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
