// backend/controllers/assignmentController.js
const db = require("../db");

// Get all assignments (for students or public)
exports.getAllAssignments = (req, res) => {
  const query = "SELECT * FROM assignments ORDER BY due_date ASC";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Get assignment by ID
exports.getAssignmentById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM assignments WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ error: "Assignment not found" });
    res.json(result[0]);
  });
};

// Get assignments created by a specific instructor
exports.getInstructorAssignments = (req, res, instructorId) => {
  const query = "SELECT * FROM assignments WHERE instructor_id = ? ORDER BY due_date ASC";
  db.query(query, [instructorId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Create new assignment (instructor)
exports.createAssignment = (req, res) => {
  const { title, description, max_score, due_date } = req.body;
  const instructor_id = req.user.id;

  const query = "INSERT INTO assignments (title, description, max_score, due_date, instructor_id) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [title, description, max_score, due_date, instructor_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Assignment created successfully", assignmentId: result.insertId });
  });
};

// Update assignment
exports.updateAssignment = (req, res) => {
  const { id } = req.params;
  const { title, description, max_score, due_date } = req.body;
  const query = "UPDATE assignments SET title = ?, description = ?, max_score = ?, due_date = ? WHERE id = ?";
  db.query(query, [title, description, max_score, due_date, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Assignment updated successfully" });
  });
};

// Delete assignment
exports.deleteAssignment = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM assignments WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Assignment deleted successfully" });
  });
};

// Get assignments for student (all assignments)
exports.getAllAssignmentsForStudent = (req, res) => {
  const query = "SELECT * FROM assignments ORDER BY due_date ASC";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};