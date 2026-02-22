const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middleware/auth");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".txt", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, TXT, DOC, DOCX files are allowed"));
    }
  },
});

// Submit assignment (student)
router.post(
  "/submit",
  upload.single("file"),
  submissionController.submitAssignment,
);

// Get submission by ID
router.get("/:id", submissionController.getSubmissionById);

// Get student's submissions
router.get("/student/:student_id", submissionController.getStudentSubmissions);

// Get all submissions for an assignment (instructor view)
router.get(
  "/assignment/:assignment_id",
  submissionController.getAssignmentSubmissions,
);

// Get feedback for a submission
router.get("/feedback/:submission_id", submissionController.getFeedback);

module.exports = router;
