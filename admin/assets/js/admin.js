// admin.js - Admin Panel JavaScript

// Initialize admin panel without authentication for now
document.addEventListener('DOMContentLoaded', () => {
  console.log("Admin panel initialized");

  // Wait for Firebase to be ready
  const checkFirebaseReady = () => {
    if (typeof firestore !== 'undefined') {
      console.log("Firebase is ready, loading dashboard data");
      hidePageLoader();
      loadDashboardData();
    } else {
      console.log("Waiting for Firebase...");
      setTimeout(checkFirebaseReady, 100);
    }
  };

  checkFirebaseReady();
});

// Hide Page Loader
function hidePageLoader() {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    loader.style.display = 'none';
  }
}

// Sidebar Navigation
document.addEventListener('DOMContentLoaded', () => {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.section');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Remove active class from all links
      sidebarLinks.forEach(l => l.classList.remove('active'));

      // Add active class to clicked link
      link.classList.add('active');

      // Hide all sections
      sections.forEach(section => section.classList.remove('active'));

      // Show selected section
      const targetSection = document.getElementById(link.dataset.section);
      if (targetSection) {
        targetSection.classList.add('active');

        // Load data for specific sections
        if (link.dataset.section === 'requests') {
          loadRequestsTable();
        }
      }
    });
  });
});

// Load Dashboard Data
async function loadDashboardData() {
  try {
    // Get total requests
    const requestsSnapshot = await firestore.collection('requests').get();
    const totalRequests = requestsSnapshot.size;
    document.getElementById('totalRequests').textContent = totalRequests;

    // Get pending requests
    const pendingSnapshot = await firestore.collection('requests').where('status', '==', 'pending').get();
    const pendingRequests = pendingSnapshot.size;
    document.getElementById('pendingRequests').textContent = pendingRequests;

    // Get completed requests
    const completedSnapshot = await firestore.collection('requests').where('status', '==', 'completed').get();
    const completedRequests = completedSnapshot.size;
    document.getElementById('completedRequests').textContent = completedRequests;

    // Get total users
    const profilesSnapshot = await firestore.collection('profiles').get();
    const totalUsers = profilesSnapshot.size;
    document.getElementById('totalUsers').textContent = totalUsers;

    // Load requests table
    loadRequestsTable();

    // Load users table
    loadUsersTable();

  } catch (error) {
    console.error("Error loading dashboard data:", error);
    showModal("Error", "Failed to load dashboard data. Please try again.");
  }
}



// Load Users Table
async function loadUsersTable() {
  try {
    const profilesSnapshot = await firestore.collection('profiles').get();
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';

    profilesSnapshot.forEach(doc => {
      const user = doc.data();
      const row = createUserRow(doc.id, user);
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

// Create User Row
function createUserRow(id, user) {
  const row = document.createElement('tr');

  const fullName = [
    user.firstName,
    user.middleName,
    user.lastName,
    user.suffix,
  ].filter(Boolean).join(' ');

  row.innerHTML = `
    <td>${id.substring(0, 8)}...</td>
    <td>${fullName || 'N/A'}</td>
    <td>${user.email || 'N/A'}</td>
    <td>${user.role || 'user'}</td>
    <td>
      <button class="action-btn" onclick="viewUserDetails('${id}')">View</button>
    </td>
  `;

  return row;
}




// Helper Functions for User Details
function buildPersonalInfo(user, isEditMode = false) {
  const fullName = [user.firstName, user.middleName, user.lastName, user.suffix].filter(Boolean).join(' ');
  const dob = user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A';

  return `<div class="detail-section">
            <h3>Full Name</h3>
            <p>${fullName || "N/A"}</p>
          </div>
          <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">First Name:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="firstName" contenteditable="${isEditMode}">${user.firstName || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Middle Name:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="middleName" contenteditable="${isEditMode}">${user.middleName || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Name:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="lastName" contenteditable="${isEditMode}">${user.lastName || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Suffix:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="suffix" contenteditable="${isEditMode}">${user.suffix || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Date of Birth:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="dob" contenteditable="${isEditMode}">${dob}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Age:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="age" contenteditable="${isEditMode}">${user.age || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Sex:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="sex" contenteditable="${isEditMode}">${user.sex || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Civil Status:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="civilStatus" contenteditable="${isEditMode}">${user.civilStatus || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Nationality:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="nationality" contenteditable="${isEditMode}">${user.nationality || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Religion:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="religion" contenteditable="${isEditMode}">${user.religion || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Place of Birth:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="placeOfBirth" contenteditable="${isEditMode}">${user.placeOfBirth || ""}</span>
              </div>
            </div>
          </div>`;
}

function buildContactInfo(user, isEditMode = false) {
  return `<div class="detail-section">
            <h3>Contact Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="email" contenteditable="${isEditMode}">${user.email || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Phone Number:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="phoneNumber" contenteditable="${isEditMode}">${user.phoneNumber || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Alternate Phone:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="altPhone" contenteditable="${isEditMode}">${user.altPhone || ""}</span>
              </div>
            </div>
          </div>`;
}

function buildAddressInfo(user, isEditMode = false) {
  const address = user.completeAddress || `${user.houseNo || ""} ${user.street || ""}, Purok ${user.zone || ""}, Barangay 186, Caloocan City, Metro Manila`.trim();

  return `<div class="detail-section">
            <h3>Address</h3>
            <p class="address-text">${address}</p>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Years of Residency:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="yearsOfResidency" contenteditable="${isEditMode}">${user.yearsOfResidency || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Year Started:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="yearStarted" contenteditable="${isEditMode}">${user.yearStarted || ""}</span>
              </div>
            </div>
          </div>`;
}

function buildEmploymentEducation(user, isEditMode = false) {
  return `<div class="detail-section">
            <h3>Employment & Education</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Employment Status:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="employmentStatus" contenteditable="${isEditMode}">${user.employmentStatus || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Occupation:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="occupation" contenteditable="${isEditMode}">${user.occupation || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Employer:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="employer" contenteditable="${isEditMode}">${user.employer || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Student Type:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="studentType" contenteditable="${isEditMode}">${user.studentType || ""}</span>
              </div>
            </div>
          </div>`;
}

function buildHealthMedical(user, isEditMode = false) {
  return `<div class="detail-section">
            <h3>Health & Medical</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Vaccination Status:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="vaccinationStatus" contenteditable="${isEditMode}">${user.vaccinationStatus || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Medical Conditions:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="medicalConditions" contenteditable="${isEditMode}">${user.medicalConditions || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Allergies:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="allergies" contenteditable="${isEditMode}">${user.allergies || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Maintenance Medicine:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="maintenanceMedicine" contenteditable="${isEditMode}">${user.maintenanceMedicine || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">PWD:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="pwd" contenteditable="${isEditMode}">${user.pwd || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">PWD ID:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="pwdId" contenteditable="${isEditMode}">${user.pwdId || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Senior Citizen:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="seniorCitizen" contenteditable="${isEditMode}">${user.seniorCitizen || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Senior ID:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="seniorId" contenteditable="${isEditMode}">${user.seniorId || ""}</span>
              </div>
            </div>
          </div>`;
}

function buildSocialServices(user, isEditMode = false) {
  return `<div class="detail-section">
            <h3>Social Services</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">4Ps Beneficiary:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="fourPs" contenteditable="${isEditMode}">${user.fourPs || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">4Ps ID:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="fourPsId" contenteditable="${isEditMode}">${user.fourPsId || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Indigent:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="indigent" contenteditable="${isEditMode}">${user.indigent || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Solo Parent:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="soloParent" contenteditable="${isEditMode}">${user.soloParent || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Solo Parent ID:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="soloParentId" contenteditable="${isEditMode}">${user.soloParentId || ""}</span>
              </div>
            </div>
          </div>`;
}

function buildDocuments(user, isEditMode = false) {
  return `<div class="detail-section">
            <h3>Documents & Identification</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">National ID:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="nationalId" contenteditable="${isEditMode}">${user.nationalId || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Passport:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="passport" contenteditable="${isEditMode}">${user.passport || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Driver's License:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="driversLicense" contenteditable="${isEditMode}">${user.driversLicense || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Voter's ID:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="votersId" contenteditable="${isEditMode}">${user.votersId || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">SSS:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="sss" contenteditable="${isEditMode}">${user.sss || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">PhilHealth:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="philhealth" contenteditable="${isEditMode}">${user.philhealth || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Pag-IBIG:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="pagibig" contenteditable="${isEditMode}">${user.pagibig || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">TIN:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="tin" contenteditable="${isEditMode}">${user.tin || ""}</span>
              </div>
            </div>
          </div>`;
}

function buildEmergencyContact(user, isEditMode = false) {
  return `<div class="detail-section">
            <h3>Emergency Contact</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Name:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="emergencyName" contenteditable="${isEditMode}">${user.emergencyName || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Relationship:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="emergencyRelation" contenteditable="${isEditMode}">${user.emergencyRelation || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Number:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="emergencyNumber" contenteditable="${isEditMode}">${user.emergencyNumber || ""}</span>
              </div>
            </div>
          </div>`;
}

function buildHouseholdInfo(user, isEditMode = false) {
  return `<div class="detail-section">
            <h3>Household Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Household Head:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="householdHead" contenteditable="${isEditMode}">${user.householdHead || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Household Head Name:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="householdHeadName" contenteditable="${isEditMode}">${user.householdHeadName || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Household Members:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="householdMembers" contenteditable="${isEditMode}">${user.householdMembers || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Household Income:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="householdIncome" contenteditable="${isEditMode}">${user.householdIncome || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Income Range:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="incomeRange" contenteditable="${isEditMode}">${user.incomeRange || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">House Ownership:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="houseOwnership" contenteditable="${isEditMode}">${user.houseOwnership || ""}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Housing Type:</span>
                <span class="detail-value ${isEditMode ? 'editable' : ''}" data-field="housingType" contenteditable="${isEditMode}">${user.housingType || ""}</span>
              </div>
            </div>
          </div>`;
}

function buildOtherInfo(user) {
  const submittedAt = user.submittedAt ? new Date(user.submittedAt).toLocaleDateString() : 'N/A';

  return `<div class="detail-section">
            <h3>Other Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">OFW Family:</span>
                <span class="detail-value">${user.ofwFamily || "N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Precinct Number:</span>
                <span class="detail-value">${user.precinctNumber || "N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">${user.notes || "N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Submitted At:</span>
                <span class="detail-value">${submittedAt}</span>
              </div>
            </div>
          </div>`;
}

// View User Details
async function viewUserDetails(userId, isEditMode = false) {
  try {
    const doc = await firestore.collection('profiles').doc(userId).get();

    if (!doc.exists) {
      showModal("Error", "User not found.");
      return;
    }

    const user = doc.data();

    const details = buildPersonalInfo(user, isEditMode) +
                    buildContactInfo(user, isEditMode) +
                    buildAddressInfo(user, isEditMode) +
                    buildEmploymentEducation(user, isEditMode) +
                    buildHealthMedical(user, isEditMode) +
                    buildSocialServices(user, isEditMode) +
                    buildDocuments(user, isEditMode) +
                    buildEmergencyContact(user, isEditMode) +
                    buildHouseholdInfo(user, isEditMode) +
                    buildOtherInfo(user, isEditMode);

    // Show user details section
    document.getElementById('userDetailsContent').innerHTML = details;
    document.getElementById('userDetailsSection').dataset.userId = userId;
    document.getElementById('userDetailsSection').style.display = 'block';

  } catch (error) {
    console.error("Error viewing user details:", error);
    showModal("Error", "Failed to load user details.");
  }
}

// Edit User Info
async function editUserInfo(userId) {
  try {
    // Switch to edit mode
    await viewUserDetails(userId, true);

    // Change the edit button to save button
    const editBtn = document.getElementById('editUserBtn');
    editBtn.textContent = 'Save Changes';
    editBtn.onclick = () => saveUserInfo(userId);

    // Add a cancel button
    const userActions = document.querySelector('.user-actions');
    if (!document.getElementById('cancelEditBtn')) {
      const cancelBtn = document.createElement('button');
      cancelBtn.id = 'cancelEditBtn';
      cancelBtn.className = 'action-btn cancel-btn';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.onclick = () => cancelEdit(userId);
      userActions.appendChild(cancelBtn);
    }

  } catch (error) {
    console.error("Error entering edit mode:", error);
    showModal("Error", "Failed to enter edit mode.");
  }
}

// Save User Info
async function saveUserInfo(userId) {
  try {
    const editableFields = document.querySelectorAll('.detail-value.editable');
    const updates = {};

    editableFields.forEach(field => {
      const fieldName = field.dataset.field;
      const value = field.textContent.trim();

      // Handle special cases
      if (fieldName === 'dob' && value && value !== 'N/A') {
        // Try to parse date
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          updates[fieldName] = date;
        }
      } else if (fieldName === 'age' && value) {
        const age = parseInt(value);
        if (!isNaN(age)) {
          updates[fieldName] = age;
        }
      } else if (value && value !== 'N/A') {
        updates[fieldName] = value;
      } else if (value === '') {
        updates[fieldName] = null; // Clear empty fields
      }
    });

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

      await firestore.collection('profiles').doc(userId).update(updates);

      showModal("Success", "User information updated successfully.");
      cancelEdit(userId); // Exit edit mode
      loadUsersTable(); // Refresh the table
    } else {
      showModal("Info", "No changes to save.");
    }

  } catch (error) {
    console.error("Error saving user info:", error);
    showModal("Error", "Failed to save user information.");
  }
}

// Cancel Edit
function cancelEdit(userId) {
  // Switch back to view mode
  viewUserDetails(userId, false);

  // Restore the edit button
  const editBtn = document.getElementById('editUserBtn');
  editBtn.textContent = 'Edit Info';
  editBtn.onclick = () => editUserInfo(userId);

  // Remove cancel button
  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) {
    cancelBtn.remove();
  }
}

// Archive User
async function archiveUser(userId) {
  try {
    if (!confirm("Are you sure you want to archive this user? This action cannot be undone.")) {
      return;
    }

    // Move user to archived collection
    const userDoc = await firestore.collection('profiles').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();

      // Add archive timestamp
      userData.archivedAt = firebase.firestore.FieldValue.serverTimestamp();
      userData.archivedBy = firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'admin-system';

      // Move to archived collection
      await firestore.collection('archived_profiles').doc(userId).set(userData);

      // Delete from active profiles
      await firestore.collection('profiles').doc(userId).delete();

      showModal("Success", "User has been archived successfully.");
      document.getElementById('userDetailsSection').style.display = 'none';
      loadUsersTable(); // Refresh the table
      loadDashboardData(); // Refresh dashboard stats
    }

  } catch (error) {
    console.error("Error archiving user:", error);
    showModal("Error", "Failed to archive user.");
  }
}

// Modal Functions
function showModal(title, message) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  document.getElementById('globalModal').style.display = 'flex';
}

// Close Modals
document.addEventListener('DOMContentLoaded', () => {
  // Global Modal
  document.getElementById('modalCloseBtn').addEventListener('click', () => {
    document.getElementById('globalModal').style.display = 'none';
  });

  // Request Modal
  document.getElementById('requestModalCloseBtn').addEventListener('click', () => {
    document.getElementById('requestModal').style.display = 'none';
  });

  // Update Status Button
  document.getElementById('updateStatusBtn').addEventListener('click', () => {
    const requestId = document.getElementById('modalRequestId').textContent;
    const newStatus = prompt("Enter new status (pending, processing, completed, rejected, cancelled):");
    if (newStatus) {
      updateRequestStatus(requestId, newStatus.toLowerCase());
      document.getElementById('requestModal').style.display = 'none';
    }
  });

  // Cancel Request Button
  document.getElementById('cancelRequestBtn').addEventListener('click', () => {
    const requestId = document.getElementById('modalRequestId').textContent;
    if (confirm("Are you sure you want to cancel this request?")) {
      updateRequestStatus(requestId, 'cancelled');
      document.getElementById('requestModal').style.display = 'none';
    }
  });

  // Close User Details Button
  document.getElementById('closeUserDetailsBtn').addEventListener('click', () => {
    document.getElementById('userDetailsSection').style.display = 'none';
  });

  // Edit User Button
  document.getElementById('editUserBtn').addEventListener('click', () => {
    const userId = document.getElementById('userDetailsSection').dataset.userId;
    if (userId) {
      editUserInfo(userId);
    }
  });

  // Archive User Button
  document.getElementById('archiveUserBtn').addEventListener('click', () => {
    const userId = document.getElementById('userDetailsSection').dataset.userId;
    if (userId) {
      archiveUser(userId);
    }
  });
});
