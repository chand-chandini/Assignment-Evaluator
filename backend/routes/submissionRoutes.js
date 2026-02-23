// backend/routes/submissionRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middleware/auth");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".txt", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, TXT, DOC, DOCX allowed"));
  },
});

// Student routes
router.post(
  "/submit",
  authMiddleware.verifyToken,
  authMiddleware.isStudent,
  upload.single("file"),
  submissionController.submitAssignment,
);

router.get(
  "/student",
  authMiddleware.verifyToken,
  authMiddleware.isStudent,
  (req, res) =>
    submissionController.getStudentSubmissions(req, res, req.user.id),
);

// Instructor routes
router.get(
  "/assignment/:assignment_id",
  authMiddleware.verifyToken,
  authMiddleware.isInstructor,
  submissionController.getAssignmentSubmissions,
);

// Common routes
router.get(
  "/:id",
  authMiddleware.verifyToken,
  submissionController.getSubmissionById,
);
router.get(
  "/feedback/:submission_id",
  authMiddleware.verifyToken,
  submissionController.getFeedback,
);

module.exports = router;
