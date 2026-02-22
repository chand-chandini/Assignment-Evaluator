// backend/routes/assignmentRoutes.js
const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/auth");

// Get all assignments
router.get("/", assignmentController.getAllAssignments);

// Get assignment by ID
router.get("/:id", assignmentController.getAssignmentById);

// Get instructor's assignments
router.get(
  "/instructor/:instructor_id",
  assignmentController.getInstructorAssignments,
);

// Create new assignment (instructor only)
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isInstructor,
  assignmentController.createAssignment,
);

// Update assignment
router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.isInstructor,
  assignmentController.updateAssignment,
);

// Delete assignment
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.isInstructor,
  assignmentController.deleteAssignment,
);

module.exports = router;
