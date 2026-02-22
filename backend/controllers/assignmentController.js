const db = require("../database/db");

// Mock/test data for when database is unavailable
const mockAssignments = [
  {
    id: 1,
    title: "Essay on Climate Change",
    description:
      "Write a 500-word essay on climate change and its environmental impacts",
    instructor_id: 3,
    instructor_name: "prof_wilson",
    max_score: 100,
    due_date: "2024-12-01 23:59:59",
    created_at: "2024-10-15 10:00:00",
  },
  {
    id: 2,
    title: "Math Problem Set 1",
    description: "Solve the following calculus problems from chapters 5-7",
    instructor_id: 3,
    instructor_name: "prof_wilson",
    max_score: 100,
    due_date: "2024-11-30 23:59:59",
    created_at: "2024-10-16 11:00:00",
  },
];

// Helper function to check if database is connected
function isDatabaseConnected() {
  return db && db.connection && db.connection.state !== "disconnected";
}

// Get all assignments
exports.getAllAssignments = (req, res) => {
  // If database not available, return mock data
  if (!isDatabaseConnected()) {
    console.log("Database unavailable - returning mock assignments");
    return res.json(mockAssignments);
  }

  const query = `
        SELECT a.*, u.username as instructor_name 
        FROM assignments a 
        JOIN users u ON a.instructor_id = u.id
        ORDER BY a.created_at DESC
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching assignments:", err);
      // Return mock data on error
      return res.json(mockAssignments);
    }
    res.json(results);
  });
};

// Get assignment by ID
exports.getAssignmentById = (req, res) => {
  const { id } = req.params;

  // If database not available, return mock data
  if (!isDatabaseConnected()) {
    const mockAssignment = mockAssignments.find((a) => a.id == id);
    if (mockAssignment) {
      return res.json(mockAssignment);
    }
    return res
      .status(404)
      .json({ error: "Assignment not found (database unavailable)" });
  }

  const query = "SELECT * FROM assignments WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching assignment:", err);
      // Try mock data on error
      const mockAssignment = mockAssignments.find((a) => a.id == id);
      if (mockAssignment) {
        return res.json(mockAssignment);
      }
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.json(results[0]);
  });
};

// Get assignments by instructor
exports.getInstructorAssignments = (req, res) => {
  const { instructor_id } = req.params;

  // If database not available, return mock data
  if (!isDatabaseConnected()) {
    console.log("Database unavailable - returning mock instructor assignments");
    return res.json(mockAssignments);
  }

  const query =
    "SELECT * FROM assignments WHERE instructor_id = ? ORDER BY created_at DESC";

  db.query(query, [instructor_id], (err, results) => {
    if (err) {
      console.error("Error fetching assignments:", err);
      return res.json(mockAssignments);
    }
    res.json(results);
  });
};

// Create new assignment
exports.createAssignment = (req, res) => {
  const { title, description, instructor_id, max_score, due_date } = req.body;

  // Validate input
  if (!title || !description || !instructor_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check database availability
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      error: "Database is currently unavailable. Cannot create assignment.",
      status: "offline",
    });
  }

  const query =
    "INSERT INTO assignments (title, description, instructor_id, max_score, due_date) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [title, description, instructor_id, max_score || 100, due_date],
    (err, result) => {
      if (err) {
        console.error("Error creating assignment:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({
        message: "Assignment created successfully",
        assignment_id: result.insertId,
      });
    },
  );
};

// Update assignment
exports.updateAssignment = (req, res) => {
  const { id } = req.params;
  const { title, description, max_score, due_date } = req.body;

  // Check database availability
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      error: "Database is currently unavailable. Cannot update assignment.",
      status: "offline",
    });
  }

  const query =
    "UPDATE assignments SET title = ?, description = ?, max_score = ?, due_date = ? WHERE id = ?";

  db.query(
    query,
    [title, description, max_score, due_date, id],
    (err, result) => {
      if (err) {
        console.error("Error updating assignment:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      res.json({ message: "Assignment updated successfully" });
    },
  );
};

// Delete assignment
exports.deleteAssignment = (req, res) => {
  const { id } = req.params;

  // Check database availability
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      error: "Database is currently unavailable. Cannot delete assignment.",
      status: "offline",
    });
  }

  const query = "DELETE FROM assignments WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting assignment:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json({ message: "Assignment deleted successfully" });
  });
};
