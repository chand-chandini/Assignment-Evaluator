CREATE DATABASE IF NOT EXISTS assignment_platform;
USE assignment_platform;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructor_id INT,
    max_score INT DEFAULT 100,
    due_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Submissions table
CREATE TABLE submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT,
    student_id INT,
    submission_text TEXT,
    file_path VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'evaluated') DEFAULT 'pending',
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Feedback table
CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT UNIQUE,
    plagiarism_risk DECIMAL(5,2),
    feedback_summary TEXT,
    score INT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (username, email, password, role) VALUES
('john_doe', 'john@example.com', 'password123', 'student'),
('jane_smith', 'jane@example.com', 'password123', 'student'),
('prof_wilson', 'wilson@example.com', 'password123', 'instructor');

INSERT INTO assignments (title, description, instructor_id, max_score, due_date) VALUES
('Essay on Climate Change', 'Write a 500-word essay on climate change', 3, 100, '2024-12-01 23:59:59'),
('Math Problem Set 1', 'Solve the following calculus problems', 3, 100, '2024-11-30 23:59:59');