const jwt = require('jsonwebtoken');

// Verify JWT token
exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Check if user is instructor
exports.isInstructor = (req, res, next) => {
    if (req.user && req.user.role === 'instructor') {
        next();
    } else {
        return res.status(403).json({ error: 'Instructor access required' });
    }
};

// Check if user is student
exports.isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        return res.status(403).json({ error: 'Student access required' });
    }
};
