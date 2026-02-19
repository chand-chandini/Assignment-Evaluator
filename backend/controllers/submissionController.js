const db = require("../database/db");
const aiEvaluator = require("../utils/aiEvaluator");

// Mock data for when database is unavailable
const mockSubmissions = [
  {
    id: 1,
    assignment_id: 1,
    student_id: 1,
    student_name: "john_student",
    submission_text:
      "Climate change is a critical global issue affecting our planet...",
    plagiarism_risk: "LOW: 15%",
    feedback_summary:
      "✓ LOW RISK: Submission appears to be original. ✓ Good length! ✓ Well-structured content. → Can be improved by adding citations.",
    score: 85,
    submitted_at: "2024-10-20 14:30:00",
  },
  {
    id: 2,
    assignment_id: 2,
    student_id: 1,
    student_name: "john_student",
    submission_text: "Solving calculus problems with integration techniques...",
    plagiarism_risk: "LOW: 10%",
    feedback_summary:
      "✓ LOW RISK: Original work. ✓ Correct methodology. ✓ Clear steps shown.",
    score: 92,
    submitted_at: "2024-10-18 10:15:00",
  },
];

// Helper function to check if database is connected
function isDatabaseConnected() {
  return db && db.connection && db.connection.state !== "disconnected";
}

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignment_id, student_id, submission_text } = req.body;
    const file_path = req.file ? req.file.path : null;

    if (!assignment_id || !student_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // If database not available, simulate a submission
    if (!isDatabaseConnected()) {
      console.log(
        "Database unavailable - simulating submission with mock evaluation",
      );

      // Simulate AI evaluation
      const mockEvaluation = {
        plagiarism_risk: "LOW: 12%",
        feedback_summary:
          "✓ LOW RISK: Submission appears to be original. ✓ Good length! ✓ Well-structured content.",
        score: 85,
      };

      return res.status(201).json({
        message:
          "Assignment submitted and simulated evaluation completed (database offline)",
        submission_id: Date.now(),
        evaluation: mockEvaluation,
        status: "offline",
      });
    }

    // Check if student already submitted
    const checkQuery =
      "SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?";
    db.query(checkQuery, [assignment_id, student_id], async (err, results) => {
      if (err) {
        console.error("Error checking submission:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        return res
          .status(400)
          .json({ error: "You have already submitted this assignment" });
      }

      // Insert submission
      const insertQuery =
        "INSERT INTO submissions (assignment_id, student_id, submission_text, file_path) VALUES (?, ?, ?, ?)";

      db.query(
        insertQuery,
        [assignment_id, student_id, submission_text, file_path],
        async (err, result) => {
          if (err) {
            console.error("Error submitting assignment:", err);
            return res.status(500).json({ error: "Database error" });
          }

          const submission_id = result.insertId;

          // Get all submissions for this assignment for plagiarism check
          const getSubmissionsQuery =
            "SELECT * FROM submissions WHERE assignment_id = ?";
          db.query(
            getSubmissionsQuery,
            [assignment_id],
            async (err, submissions) => {
              if (err) {
                console.error("Error fetching submissions:", err);
                return res.status(201).json({
                  message: "Assignment submitted but AI evaluation failed",
                  submission_id,
                });
              }

              // Perform AI evaluation
              try {
                // Create submission object for evaluator
                const currentSubmissionForEval = {
                  id: submission_id,
                  submission_text: submission_text || "No text provided",
                };

                const evaluationResult = await aiEvaluator.evaluateSubmission(
                  currentSubmissionForEval,
                  submissions,
                );

                // Save feedback
                const feedbackQuery =
                  "INSERT INTO feedback (submission_id, plagiarism_risk, feedback_summary, score) VALUES (?, ?, ?, ?)";
                db.query(
                  feedbackQuery,
                  [
                    submission_id,
                    evaluationResult.plagiarism_risk,
                    evaluationResult.feedback_summary,
                    evaluationResult.score,
                  ],
                  (err) => {
                    if (err) {
                      console.error("Error saving feedback:", err);
                    }
                  },
                );

                // Update submission status
                db.query(
                  'UPDATE submissions SET status = "evaluated" WHERE id = ?',
                  [submission_id],
                );

                res.status(201).json({
                  message: "Assignment submitted and evaluated successfully",
                  submission_id,
                  evaluation: evaluationResult,
                });
              } catch (evaluationError) {
                console.error("Evaluation error:", evaluationError);
                res.status(201).json({
                  message: "Assignment submitted but evaluation failed",
                  submission_id,
                });
              }
            },
          );
        },
      );
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get submission by ID
exports.getSubmissionById = (req, res) => {
  const { id } = req.params;

  // If database not available, return mock data
  if (!isDatabaseConnected()) {
    const mockSubmission = mockSubmissions.find((s) => s.id == id);
    if (mockSubmission) {
      return res.json(mockSubmission);
    }
    return res
      .status(404)
      .json({ error: "Submission not found (database unavailable)" });
  }

  const query = "SELECT * FROM submissions WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching submission:", err);
      const mockSubmission = mockSubmissions.find((s) => s.id == id);
      if (mockSubmission) {
        return res.json(mockSubmission);
      }
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json(results[0]);
  });
};

// Get submissions for an assignment
exports.getAssignmentSubmissions = (req, res) => {
  const { assignment_id } = req.params;

  // If database not available, return mock data
  if (!isDatabaseConnected()) {
    console.log(
      "Database unavailable - returning mock submissions for assignment",
    );
    const filtered = mockSubmissions.filter(
      (s) => s.assignment_id == assignment_id,
    );
    return res.json(filtered);
  }

  const query = `
        SELECT s.*, u.username as student_name, f.plagiarism_risk, f.feedback_summary, f.score
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        LEFT JOIN feedback f ON s.id = f.submission_id
        WHERE s.assignment_id = ?
        ORDER BY s.submitted_at DESC
    `;

  db.query(query, [assignment_id], (err, results) => {
    if (err) {
      console.error("Error fetching submissions:", err);
      const filtered = mockSubmissions.filter(
        (s) => s.assignment_id == assignment_id,
      );
      return res.json(filtered);
    }

    res.json(results);
  });
};

// Get student submissions
exports.getStudentSubmissions = (req, res) => {
  const { student_id } = req.params;

  // If database not available, return mock data
  if (!isDatabaseConnected()) {
    console.log("Database unavailable - returning mock student submissions");
    const filtered = mockSubmissions.filter((s) => s.student_id == student_id);
    return res.json(filtered);
  }

  const query = `
        SELECT s.*, a.title as assignment_title, f.plagiarism_risk, f.feedback_summary, f.score
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        LEFT JOIN feedback f ON s.id = f.submission_id
        WHERE s.student_id = ?
        ORDER BY s.submitted_at DESC
    `;

  db.query(query, [student_id], (err, results) => {
    if (err) {
      console.error("Error fetching submissions:", err);
      const filtered = mockSubmissions.filter(
        (s) => s.student_id == student_id,
      );
      return res.json(filtered);
    }

    res.json(results);
  });
};

// Get feedback for a submission
exports.getFeedback = (req, res) => {
  const { submission_id } = req.params;

  // If database not available, return mock feedback
  if (!isDatabaseConnected()) {
    const mockSubmission = mockSubmissions.find((s) => s.id == submission_id);
    if (mockSubmission) {
      return res.json({
        submission_id,
        plagiarism_risk: mockSubmission.plagiarism_risk,
        feedback_summary: mockSubmission.feedback_summary,
        score: mockSubmission.score,
      });
    }
    return res
      .status(404)
      .json({ error: "Feedback not found (database unavailable)" });
  }

  const query = "SELECT * FROM feedback WHERE submission_id = ?";

  db.query(query, [submission_id], (err, results) => {
    if (err) {
      console.error("Error fetching feedback:", err);
      const mockSubmission = mockSubmissions.find((s) => s.id == submission_id);
      if (mockSubmission) {
        return res.json({
          submission_id,
          plagiarism_risk: mockSubmission.plagiarism_risk,
          feedback_summary: mockSubmission.feedback_summary,
          score: mockSubmission.score,
        });
      }
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json(results[0]);
  });
};
