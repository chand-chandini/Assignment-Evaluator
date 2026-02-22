const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

// Signup
router.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body;
  const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  
  db.query(query, [name, email, password, role], (err, result) => {
    if(err) return res.status(500).json({ error: err });
    res.json({ message: "Signup successful" });
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  
  db.query(query, [email, password], (err, result) => {
    if(err) return res.status(500).json({ error: err });
    if(result.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = result[0];
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

module.exports = router;