// backend/routes/assignmentRoutes.js
const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/auth");

// Public: Get all assignments
router.get("/", assignmentController.getAllAssignments);

// Get assignment by ID
router.get("/:id", assignmentController.getAssignmentById);

// Instructor routes
router.get(
  "/instructor",
  authMiddleware.verifyToken,
  authMiddleware.isInstructor,
  (req, res) => assignmentController.getInstructorAssignments(req, res, req.user.id)
);

router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isInstructor,
  assignmentController.createAssignment
);

router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.isInstructor,
  assignmentController.updateAssignment
);

router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.isInstructor,
  assignmentController.deleteAssignment
);

// Student routes
router.get(
  "/student",
  authMiddleware.verifyToken,
  authMiddleware.isStudent,
  assignmentController.getAllAssignmentsForStudent
);

module.exports = router;