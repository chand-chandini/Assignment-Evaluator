// Configuration
const API_BASE_URL = "http://localhost:5000/api";

// Store user data
let currentUser = {
  id: 1,
  username: "john_doe",
  email: "john@example.com",
  role: "student",
};

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (currentPage === "student-dashboard.html") {
    initializeStudentDashboard();
  } else if (currentPage === "instructor-dashboard.html") {
    initializeInstructorDashboard();
  }
});

// ====== STUDENT DASHBOARD FUNCTIONS ======

function initializeStudentDashboard() {
  loadAssignments();
  loadStudentSubmissions();
  updateStudentProfile();
}

function updateStudentProfile() {
  document.getElementById("studentDisplayName").textContent =
    currentUser.username;
  document.getElementById("studentEmail").textContent = currentUser.email;
  document.getElementById("studentName").textContent = currentUser.username;
}

function loadAssignments() {
  fetch(`${API_BASE_URL}/assignments/`)
    .then((response) => response.json())
    .then((data) => {
      displayAssignments(data);
    })
    .catch((error) => {
      console.error("Error loading assignments:", error);
      document.getElementById("assignmentsList").innerHTML =
        "<p>Error loading assignments</p>";
    });
}

function displayAssignments(assignments) {
  const container = document.getElementById("assignmentsList");
  container.innerHTML = "";

  if (assignments.length === 0) {
    container.innerHTML = "<p>No assignments available</p>";
    return;
  }

  assignments.forEach((assignment) => {
    const dueDate = new Date(assignment.due_date).toLocaleDateString();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
            <div class="card-header">
                <h3>${assignment.title}</h3>
                <span class="badge">${assignment.max_score} pts</span>
            </div>
            <div class="card-body">
                <p>${assignment.description.substring(0, 100)}...</p>
                <p class="meta">Instructor: ${assignment.instructor_name}</p>
                <p class="meta">Due: ${dueDate}</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary" onclick="openSubmitModal(${assignment.id}, '${assignment.title}')">Submit</button>
            </div>
        `;
    container.appendChild(card);
  });
}

function loadStudentSubmissions() {
  fetch(`${API_BASE_URL}/submissions/student/${currentUser.id}`)
    .then((response) => response.json())
    .then((data) => {
      displaySubmissions(data);
    })
    .catch((error) => {
      console.error("Error loading submissions:", error);
    });
}

function displaySubmissions(submissions) {
  const container = document.getElementById("submissionsList");
  container.innerHTML = "";

  if (submissions.length === 0) {
    container.innerHTML = "<p>No submissions yet</p>";
    return;
  }

  submissions.forEach((submission) => {
    const submittedDate = new Date(
      submission.submitted_at,
    ).toLocaleDateString();
    const statusClass =
      submission.status === "evaluated" ? "status-evaluated" : "status-pending";
    const scoreDisplay = submission.score ? `${submission.score}/100` : "-";

    // Determine plagiarism risk level for styling
    const plagiarismRisk = parseFloat(submission.plagiarism_risk || 0);
    let plagiarismClass = "plagiarism-low";
    if (plagiarismRisk > 80) {
      plagiarismClass = "plagiarism-high";
    } else if (plagiarismRisk > 60) {
      plagiarismClass = "plagiarism-medium";
    }

    const plagiarismDisplay = submission.plagiarism_risk
      ? `<p class="plagiarism ${plagiarismClass}">Plagiarism Risk: ${submission.plagiarism_risk}%</p>`
      : "";

    const item = document.createElement("div");
    item.className = "submission-item";
    item.innerHTML = `
            <div class="submission-header">
                <h4>${submission.assignment_title}</h4>
                <span class="status ${statusClass}">${submission.status}</span>
            </div>
            <div class="submission-details">
                <p class="submitted-date">Submitted: ${submittedDate}</p>
                <p class="score-display">Score: <strong>${scoreDisplay}</strong></p>
                ${plagiarismDisplay}
                ${submission.feedback_summary ? `<div class="feedback-box"><p class="feedback-title">AI Feedback:</p><p class="feedback-text">${submission.feedback_summary}</p></div>` : ""}
            </div>
        `;
    container.appendChild(item);
  });

  // Update statistics
  updateStudentStats(submissions);
}

function updateStudentStats(submissions) {
  document.getElementById("totalSubmissions").textContent = submissions.length;

  if (submissions.length > 0) {
    const scores = submissions
      .filter((s) => s.score)
      .map((s) => parseInt(s.score));

    if (scores.length > 0) {
      const avgScore = (
        scores.reduce((a, b) => a + b, 0) / scores.length
      ).toFixed(1);
      document.getElementById("avgScore").textContent = avgScore;
    }
  }
}

function openSubmitModal(assignmentId, assignmentTitle) {
  document.getElementById("assignmentId").value = assignmentId;
  document.getElementById("modalTitle").textContent =
    `Submit: ${assignmentTitle}`;
  document.getElementById("submitModal").style.display = "block";
}

function closeModal() {
  document.getElementById("submitModal").style.display = "none";
  document.getElementById("submitForm").reset();
}

function submitAssignment(event) {
  event.preventDefault();

  const assignmentId = document.getElementById("assignmentId").value;
  const submissionText = document.getElementById("submissionText").value;
  const fileInput = document.getElementById("fileUpload");

  const formData = new FormData();
  formData.append("assignment_id", assignmentId);
  formData.append("student_id", currentUser.id);
  formData.append("submission_text", submissionText);

  if (fileInput.files.length > 0) {
    formData.append("file", fileInput.files[0]);
  }

  fetch(`${API_BASE_URL}/submissions/submit`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert("Assignment submitted successfully!");
        closeModal();
        loadStudentSubmissions();
        loadAssignments();
      }
    })
    .catch((error) => {
      console.error("Error submitting assignment:", error);
      alert("Error submitting assignment");
    });
}

function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove active class from all buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab
  const tabElement = document.getElementById(tabName + "-tab");
  if (tabElement) {
    tabElement.classList.add("active");
  }

  // Mark button as active
  event.target.classList.add("active");
}

function logout() {
  alert("Logged out successfully");
  window.location.href = "index.html";
}

// ====== INSTRUCTOR DASHBOARD FUNCTIONS ======

function initializeInstructorDashboard() {
  currentUser = {
    id: 3,
    username: "prof_wilson",
    email: "wilson@example.com",
    role: "instructor",
  };

  loadInstructorAssignments();
  loadAllSubmissions();
  updateInstructorProfile();
}

function updateInstructorProfile() {
  document.getElementById("instructorDisplayName").textContent =
    currentUser.username;
  document.getElementById("instructorEmail").textContent = currentUser.email;
  document.getElementById("instructorName").textContent = currentUser.username;
}

function loadInstructorAssignments() {
  fetch(`${API_BASE_URL}/assignments/instructor/${currentUser.id}`)
    .then((response) => response.json())
    .then((data) => {
      displayInstructorAssignments(data);
    })
    .catch((error) => {
      console.error("Error loading assignments:", error);
    });
}

function displayInstructorAssignments(assignments) {
  const container = document.getElementById("instructorAssignmentsList");
  container.innerHTML = "";

  if (assignments.length === 0) {
    container.innerHTML = "<p>No assignments created yet</p>";
    return;
  }

  assignments.forEach((assignment) => {
    const dueDate = new Date(assignment.due_date).toLocaleDateString();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
            <div class="card-header">
                <h3>${assignment.title}</h3>
                <span class="badge">${assignment.max_score} pts</span>
            </div>
            <div class="card-body">
                <p>${assignment.description.substring(0, 100)}...</p>
                <p class="meta">Due: ${dueDate}</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary btn-sm" onclick="viewAssignmentSubmissions(${assignment.id})">View Submissions</button>
                <button class="btn btn-secondary btn-sm" onclick="editAssignment(${assignment.id})">Edit</button>
            </div>
        `;
    container.appendChild(card);
  });
}

function loadAllSubmissions() {
  fetch(`${API_BASE_URL}/assignments/`)
    .then((response) => response.json())
    .then((assignments) => {
      let allSubmissions = [];
      let loadedCount = 0;

      if (assignments.length === 0) {
        displayAllSubmissions([]);
        return;
      }

      assignments.forEach((assignment) => {
        fetch(`${API_BASE_URL}/submissions/assignment/${assignment.id}`)
          .then((response) => response.json())
          .then((submissions) => {
            allSubmissions = [...allSubmissions, ...submissions];
            loadedCount++;

            if (loadedCount === assignments.length) {
              displayAllSubmissions(allSubmissions);
            }
          });
      });
    })
    .catch((error) => {
      console.error("Error loading submissions:", error);
    });
}

function displayAllSubmissions(submissions) {
  const container = document.getElementById("allSubmissionsList");
  container.innerHTML = "";

  if (submissions.length === 0) {
    container.innerHTML = "<p>No submissions yet</p>";
    return;
  }

  submissions.forEach((submission) => {
    const submittedDate = new Date(
      submission.submitted_at,
    ).toLocaleDateString();
    const statusClass =
      submission.status === "evaluated" ? "status-evaluated" : "status-pending";
    const scoreDisplay = submission.score ? `${submission.score}/100` : "-";

    const item = document.createElement("div");
    item.className = "submission-item";
    item.innerHTML = `
            <div class="submission-header">
                <h4>${submission.student_name}</h4>
                <span class="status ${statusClass}">${submission.status}</span>
            </div>
            <div class="submission-details">
                <p>Submitted: ${submittedDate}</p>
                <p>Score: ${scoreDisplay}</p>
                <p>Plagiarism Risk: ${submission.plagiarism_risk ? submission.plagiarism_risk + "%" : "-"}</p>
            </div>
            <button class="btn btn-sm" onclick="viewSubmissionDetails(${submission.id})">View Details</button>
        `;
    container.appendChild(item);
  });
}

function viewAssignmentSubmissions(assignmentId) {
  fetch(`${API_BASE_URL}/submissions/assignment/${assignmentId}`)
    .then((response) => response.json())
    .then((submissions) => {
      displayAllSubmissions(submissions);
      showInstructorTab("submissions");
    })
    .catch((error) => {
      console.error("Error loading submissions:", error);
      alert("Error loading submissions");
    });
}

function showCreateAssignment() {
  document.getElementById("createAssignmentModal").style.display = "block";
}

function closeCreateModal() {
  document.getElementById("createAssignmentModal").style.display = "none";
  document.getElementById("createAssignmentForm").reset();
}

function createAssignment(event) {
  event.preventDefault();

  const title = document.getElementById("assignmentTitle").value;
  const description = document.getElementById("assignmentDesc").value;
  const maxScore = document.getElementById("maxScore").value;
  const dueDate = document.getElementById("dueDate").value;

  const assignmentData = {
    title: title,
    description: description,
    instructor_id: currentUser.id,
    max_score: parseInt(maxScore),
    due_date: dueDate,
  };

  fetch(`${API_BASE_URL}/assignments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(assignmentData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert("Assignment created successfully!");
        closeCreateModal();
        loadInstructorAssignments();
      }
    })
    .catch((error) => {
      console.error("Error creating assignment:", error);
      alert("Error creating assignment");
    });
}

function showInstructorTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove active class from all buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab
  const tabElement = document.getElementById("instructor-" + tabName + "-tab");
  if (tabElement) {
    tabElement.classList.add("active");
  }

  // Mark button as active
  if (event && event.target) {
    event.target.classList.add("active");
  }
}

function viewSubmissionDetails(submissionId) {
  fetch(`${API_BASE_URL}/submissions/${submissionId}`)
    .then((response) => response.json())
    .then((submission) => {
      document.getElementById("viewSubmissionModal").style.display = "block";
      // Populate modal with submission details
      document.getElementById("viewSubmissionModal").innerHTML = `
                <div class="modal-content modal-lg">
                    <span class="close" onclick="closeViewModal()">&times;</span>
                    <h2>Submission Details</h2>
                    <div class="submission-details-full">
                        <p><strong>Submission Text:</strong> ${submission.submission_text || "N/A"}</p>
                        <p><strong>Status:</strong> ${submission.status}</p>
                        <p><strong>Submitted:</strong> ${new Date(submission.submitted_at).toLocaleString()}</p>
                    </div>
                </div>
            `;
    })
    .catch((error) => {
      console.error("Error loading submission:", error);
      alert("Error loading submission");
    });
}

function closeViewModal() {
  document.getElementById("viewSubmissionModal").style.display = "none";
}

function editAssignment(assignmentId) {
  alert("Edit functionality coming soon");
}

// Close modals when clicking outside
window.onclick = function (event) {
  const submitModal = document.getElementById("submitModal");
  const createModal = document.getElementById("createAssignmentModal");
  const viewModal = document.getElementById("viewSubmissionModal");

  if (event.target === submitModal) {
    submitModal.style.display = "none";
  }
  if (event.target === createModal) {
    createModal.style.display = "none";
  }
  if (event.target === viewModal) {
    viewModal.style.display = "none";
  }
};
