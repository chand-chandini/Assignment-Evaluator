const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// Create a simple connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "assignment_platform",
});

// Handle connection
connection.connect((err) => {
  if (err) {
    console.error("Database connection failed - retrying:", err.code);
    setTimeout(() => {
      connection.connect();
    }, 2000);
  } else {
    console.log("✓ Connected to MySQL database");
  }
});

// Handle connection errors
connection.on("error", (err) => {
  console.error("Database error:", err.code);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    connection.connect();
  }
  if (err.code === "ER_CON_COUNT_ERROR") {
    setTimeout(() => {
      connection.connect();
    }, 2000);
  }
  if (err.code === "PROTOCOL_PACKETS_OUT_OF_ORDER") {
    connection.connect();
  }
});

module.exports = connection;
