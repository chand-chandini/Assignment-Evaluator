// API Base URL - Update this with your backend URL when deployed
const API_BASE_URL = 'http://localhost:5000/api';

// Store current user (in production, use proper authentication)
let currentUser = {
    id: 1, // Student ID
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student'
};

// For instructor demo
let instructorUser = {
    id: 3,
    name: 'Prof. Wilson',
    email: 'wilson@example.com',
    role: 'instructor'
};

// Initialize page based on current dashboard
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    if (path.includes('student-dashboard')) {
        initializeStudentDashboard();
    } else if (path.includes('instructor-dashboard')) {
        initializeInstructorDashboard();
    } else {
        // Home page
        console.log('Welcome to Assignment Platform');
    }
});

// ==================== STUDENT DASHBOARD FUNCTIONS ====================

async function initializeStudentDashboard() {
    try {
        // Set user info
        document.getElementById('studentName').textContent = currentUser.name;
        document.getElementById('studentDisplayName').textContent = currentUser.name;
        document.getElementById('studentEmail').textContent = currentUser.email;
        
        // Load assignments and submissions
        await Promise.all([
            loadAssignments(),
            loadStudentSubmissions()
        ]);
        
        // Update stats
        updateStudentStats();
        
    } catch (error) {
        showError('Failed to load dashboard data');
        console.error('Dashboard initialization error:', error);
    }
}

async function loadAssignments() {
    const assignmentsList = document.getElementById('assignmentsList');
    assignmentsList.innerHTML = '<div class="loading">Loading assignments...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/assignments`);
        const assignments = await response.json();
        
        if (assignments.length === 0) {
            assignmentsList.innerHTML = '<p class="no-data">No assignments available.</p>';
            return;
        }
        
        assignmentsList.innerHTML = assignments.map(assignment => `
            <div class="assignment-card">
                <h3>${assignment.title}</h3>
                <p>${assignment.description.substring(0, 100)}${assignment.description.length > 100 ? '...' : ''}</p>
                <div class="assignment-meta">
                    <div>📅 Due: ${formatDate(assignment.due_date)}</div>
                    <div>👨‍🏫 Instructor: ${assignment.instructor_name}</div>
                    <div>📊 Max Score: ${assignment.max_score}</div>
                </div>
                <div class="assignment-actions">
                    <button class="btn-submit" onclick="openSubmitModal(${assignment.id}, '${assignment.title}')">
                        Submit Assignment
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading assignments:', error);
        assignmentsList.innerHTML = '<p class="error">Failed to load assignments. Please try again.</p>';
    }
}

async function loadStudentSubmissions() {
    const submissionsList = document.getElementById('submissionsList');
    submissionsList.innerHTML = '<div class="loading">Loading submissions...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/submissions/student/${currentUser.id}`);
        const submissions = await response.json();
        
        if (submissions.length === 0) {
            submissionsList.innerHTML = '<p class="no-data">No submissions yet.</p>';
            return;
        }
        
        submissionsList.innerHTML = submissions.map(sub => `
            <div class="submission-item">
                <div class="submission-header">
                    <span class="submission-assignment">${sub.assignment_title}</span>
                    <span class="submission-date">${formatDate(sub.submitted_at)}</span>
                </div>
                <div class="submission-status">
                    Status: <span class="status-${sub.status}">${sub.status}</span>
                </div>
                ${sub.feedback_summary ? `
                    <div class="submission-feedback">
                        <h4>Feedback:</h4>
                        <div class="feedback-item">
                            <span>Plagiarism Risk:</span>
                            <span class="plagiarism-${getRiskLevel(sub.plagiarism_risk)}">
                                ${sub.plagiarism_risk || 'N/A'}%
                            </span>
                        </div>
                        <div class="feedback-item">
                            <span>Score:</span>
                            <span class="score">${sub.score || 'Pending'}/${sub.max_score || 100}</span>
                        </div>
                        <p><strong>Summary:</strong> ${sub.feedback_summary || 'No feedback yet'}</p>
                    </div>
                ` : '<p>Evaluation in progress...</p>'}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading submissions:', error);
        submissionsList.innerHTML = '<p class="error">Failed to load submissions.</p>';
    }
}

function updateStudentStats() {
    // This would be calculated from actual data
    document.getElementById('totalSubmissions').textContent = '5';
    document.getElementById('avgScore').textContent = '78%';
}

function openSubmitModal(assignmentId, assignmentTitle) {
    document.getElementById('assignmentId').value = assignmentId;
    document.getElementById('modalTitle').textContent = `Submit: ${assignmentTitle}`;
    document.getElementById('submitModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('submitModal').style.display = 'none';
    document.getElementById('submitForm').reset();
}

async function submitAssignment(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const fileInput = document.getElementById('fileUpload');
    
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/submissions/submit`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Assignment submitted successfully! AI evaluation in progress...');
            closeModal();
            // Refresh submissions
            await loadStudentSubmissions();
        } else {
            showError(result.error || 'Submission failed');
        }
    } catch (error) {
        console.error('Submission error:', error);
        showError('Failed to submit assignment. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Assignment';
    }
}

// ==================== INSTRUCTOR DASHBOARD FUNCTIONS ====================

function initializeInstructorDashboard() {
    // Set instructor info
    document.getElementById('instructorName').textContent = instructorUser.name;
    document.getElementById('instructorDisplayName').textContent = instructorUser.name;
    document.getElementById('instructorEmail').textContent = instructorUser.email;
    
    // Load instructor data
    loadInstructorAssignments();
    loadAllSubmissions();
}

async function loadInstructorAssignments() {
    const assignmentsList = document.getElementById('instructorAssignmentsList');
    assignmentsList.innerHTML = '<div class="loading">Loading assignments...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/assignments`);
        const assignments = await response.json();
        
        // Filter assignments by instructor (in production, use proper filtering)
        const myAssignments = assignments.filter(a => a.instructor_id === instructorUser.id);
        
        if (myAssignments.length === 0) {
            assignmentsList.innerHTML = '<p class="no-data">No assignments created yet.</p>';
            return;
        }
        
        assignmentsList.innerHTML = myAssignments.map(assignment => `
            <div class="assignment-card">
                <h3>${assignment.title}</h3>
                <p>${assignment.description}</p>
                <div class="assignment-meta">
                    <div>📅 Due: ${formatDate(assignment.due_date)}</div>
                    <div>📊 Max Score: ${assignment.max_score}</div>
                </div>
                <div class="assignment-actions">
                    <button class="btn-submit" onclick="viewAssignmentSubmissions(${assignment.id})">
                        View Submissions
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading assignments:', error);
        assignmentsList.innerHTML = '<p class="error">Failed to load assignments.</p>';
    }
}

async function loadAllSubmissions() {
    const submissionsList = document.getElementById('allSubmissionsList');
    submissionsList.innerHTML = '<div class="loading">Loading submissions...</div>';
    
    try {
        // This would need a backend endpoint to get all submissions
        // For demo, we'll show a message
        submissionsList.innerHTML = '<p class="info">Select an assignment to view submissions.</p>';
        
    } catch (error) {
        console.error('Error loading submissions:', error);
        submissionsList.innerHTML = '<p class="error">Failed to load submissions.</p>';
    }
}

async function viewAssignmentSubmissions(assignmentId) {
    showInstructorTab('submissions');
    
    const submissionsList = document.getElementById('allSubmissionsList');
    submissionsList.innerHTML = '<div class="loading">Loading submissions...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/submissions/assignment/${assignmentId}`);
        const submissions = await response.json();
        
        if (submissions.length === 0) {
            submissionsList.innerHTML = '<p class="no-data">No submissions for this assignment.</p>';
            return;
        }
        
        submissionsList.innerHTML = submissions.map(sub => `
            <div class="submission-item" onclick="viewSubmissionDetails(${sub.id})">
                <div class="submission-header">
                    <span class="submission-assignment">Student: ${sub.student_name}</span>
                    <span class="submission-date">${formatDate(sub.submitted_at)}</span>
                </div>
                <div class="submission-status">
                    Status: ${sub.status}
                </div>
                ${sub.feedback_summary ? `
                    <div class="submission-feedback">
                        <div class="feedback-item">
                            <span>Plagiarism Risk:</span>
                            <span class="plagiarism-${getRiskLevel(sub.plagiarism_risk)}">
                                ${sub.plagiarism_risk || 'N/A'}%
                            </span>
                        </div>
                        <div class="feedback-item">
                            <span>Score:</span>
                            <span class="score">${sub.score || 'N/A'}</span>
                        </div>
                    </div>
                ` : '<p>Not evaluated yet</p>'}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading submissions:', error);
        submissionsList.innerHTML = '<p class="error">Failed to load submissions.</p>';
    }
}

function showCreateAssignment() {
    document.getElementById('createAssignmentModal').style.display = 'block';
}

function closeCreateModal() {
    document.getElementById('createAssignmentModal').style.display = 'none';
    document.getElementById('createAssignmentForm').reset();
}

async function createAssignment(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/assignments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Assignment created successfully!');
            closeCreateModal();
            loadInstructorAssignments();
        } else {
            showError(result.error || 'Creation failed');
        }
    } catch (error) {
        console.error('Creation error:', error);
        showError('Failed to create assignment.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Assignment';
    }
}

function viewSubmissionDetails(submissionId) {
    // This would load detailed submission info
    document.getElementById('viewSubmissionModal').style.display = 'block';
    document.getElementById('submissionDetails').innerHTML = '<div class="loading">Loading details...</div>';
    
    // In production, fetch submission details from API
    setTimeout(() => {
        document.getElementById('submissionDetails').innerHTML = `
            <div class="submission-detail">
                <h3>Student Submission</h3>
                <p><strong>Content:</strong> Lorem ipsum dolor sit amet...</p>
                <h4>AI Evaluation:</h4>
                <p><strong>Plagiarism Risk:</strong> 22%</p>
                <p><strong>Score:</strong> 68/100</p>
                <p><strong>Feedback:</strong> The explanation lacks depth in section 2. Consider adding more examples and clarifying your arguments.</p>
            </div>
        `;
    }, 1000);
}

function closeViewModal() {
    document.getElementById('viewSubmissionModal').style.display = 'none';
}

// ==================== UTILITY FUNCTIONS ====================

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

function showInstructorTab(tabName) {
    document.querySelectorAll('#instructor-assignments-tab, #instructor-submissions-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`instructor-${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

function formatDate(dateString) {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getRiskLevel(risk) {
    if (!risk) return 'low';
    const riskNum = parseFloat(risk);
    if (riskNum > 70) return 'high';
    if (riskNum > 40) return 'medium';
    return 'low';
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function logout() {
    window.location.href = 'index.html';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}