const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

// Login controller
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];

    // Compare password
    if (password !== user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" },
    );

    // Remove password from response
    delete user.password;

    res.json({
      message: "Login successful",
      user: user,
      token: token,
    });
  });
};

// Register controller
exports.register = (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!["student", "instructor"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  // Check if user exists
  const checkQuery = "SELECT * FROM users WHERE email = ? OR username = ?";
  db.query(checkQuery, [email, username], (err, results) => {
    if (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const insertQuery =
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(
      insertQuery,
      [username, email, hashedPassword, role],
      (err, result) => {
        if (err) {
          console.error("Registration error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        res.status(201).json({
          message: "User registered successfully",
          user_id: result.insertId,
        });
      },
    );
  });
};

// Get user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;

  const query =
    "SELECT id, username, email, role, created_at FROM users WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  });
};
