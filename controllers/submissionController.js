// backend/controllers/submissionController.js
const db = require("../db");

// Submit assignment (student)
exports.submitAssignment = (req, res) => {
  const student_id = req.user.id;
  const { assignment_id } = req.body;
  const file_path = req.file ? req.file.path : null;

  if (!file_path) return res.status(400).json({ error: "File is required" });

  const query = "INSERT INTO submissions (assignment_id, student_id, file_path, submitted_at) VALUES (?, ?, ?, NOW())";
  db.query(query, [assignment_id, student_id, file_path], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Submission successful", submissionId: result.insertId });
  });
};

// Get student's submissions
exports.getStudentSubmissions = (req, res, studentId) => {
  const query = "SELECT s.*, a.title, a.max_score FROM submissions s JOIN assignments a ON s.assignment_id = a.id WHERE s.student_id = ? ORDER BY s.submitted_at DESC";
  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Get submissions for a specific assignment (instructor)
exports.getAssignmentSubmissions = (req, res) => {
  const { assignment_id } = req.params;
  const query = "SELECT s.*, u.name AS student_name, u.email AS student_email FROM submissions s JOIN users u ON s.student_id = u.id WHERE s.assignment_id = ? ORDER BY s.submitted_at DESC";
  db.query(query, [assignment_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Get submission by ID
exports.getSubmissionById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT s.*, a.title, u.name AS student_name FROM submissions s JOIN assignments a ON s.assignment_id = a.id JOIN users u ON s.student_id = u.id WHERE s.id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ error: "Submission not found" });
    res.json(result[0]);
  });
};

// Get feedback for a submission
exports.getFeedback = (req, res) => {
  const { submission_id } = req.params;
  const query = "SELECT * FROM feedback WHERE submission_id = ?";
  db.query(query, [submission_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};