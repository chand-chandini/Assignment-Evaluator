const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Public routes
router.post("/login", authController.login);
router.post("/register", authController.register);

// Protected routes
router.get("/user/:id", authMiddleware.verifyToken, authController.getUserById);

module.exports = router;
