const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken, isInstructor, isStudent } = require("../middleware/auth");

// Instructor: get own assignments
router.get("/instructor/assignments", verifyToken, isInstructor, (req, res) => {
  const instructorId = req.user.id;
  const query = "SELECT * FROM assignments WHERE instructor_id = ?";
  db.query(query, [instructorId], (err, result) => {
    if(err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// Student: get all assignments
router.get("/student/assignments", verifyToken, isStudent, (req, res) => {
  const query = "SELECT * FROM assignments"; // later you can filter per student
  db.query(query, (err, result) => {
    if(err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

module.exports = router;