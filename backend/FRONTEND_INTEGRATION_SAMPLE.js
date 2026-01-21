// SAMPLE: assets/js/api-helper.js
// Add this new file to replace direct Firebase calls

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080/api'
  : 'https://your-railway-backend-url.railway.app/api'; // Update with your Railway URL

/**
 * Make authenticated API request to backend
 * Automatically includes Firebase ID token
 */
async function apiCall(method, endpoint, body = null) {
  try {
    // Get current user and ID token
    const user = firebase.auth().currentUser;
    if (!user && !endpoint.includes('/auth/signup') && !endpoint.includes('/seed/purposes')) {
      throw new Error('User not authenticated');
    }

    const idToken = user ? await user.getIdToken() : null;

    // Build request headers
    const headers = {
      'Content-Type': 'application/json'
    };

    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    // Build request options
    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    // Make request
    console.log(`📡 ${method} ${endpoint}`, body || '');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    // Check for errors
    if (!response.ok) {
      console.error('❌ API Error:', data.error);
      throw new Error(data.error?.message || 'API request failed');
    }

    console.log('✅ API Success:', data);
    return data;

  } catch (error) {
    console.error('API Call Error:', error.message);
    throw error;
  }
}

/**
 * API methods - use these throughout frontend
 */
const api = {
  // Authentication
  signup: (email, password, firstName, middleName, lastName, birthday) =>
    apiCall('POST', '/auth/signup', { email, password, firstName, middleName, lastName, birthday }),
  
  resetPassword: (newPassword) =>
    apiCall('POST', '/auth/reset-password', { newPassword }),

  // Profile Management
  profileSave: (profileData) =>
    apiCall('POST', '/profile/save', profileData),
  
  profileLoad: () =>
    apiCall('GET', '/profile/load'),

  // Requests
  requestSubmit: (documents, purposes, notes, businessName, businessAddress, ownerName) =>
    apiCall('POST', '/request/submit', { 
      documents, 
      purposes, 
      notes, 
      businessName, 
      businessAddress, 
      ownerName 
    }),
  
  requestList: () =>
    apiCall('GET', '/request/list'),

  // Document Purposes
  getPurposes: () =>
    apiCall('GET', '/seed/purposes'),
  
  seedPurposes: (force = false) =>
    apiCall('POST', `/seed/purposes${force ? '?force=true' : ''}`, {})
};

// ============================================================
// EXAMPLE: How to update existing frontend files
// ============================================================

/*

BEFORE (index.js - login):
await window.auth.signInWithEmailAndPassword(email, password);

AFTER:
// Keep using Firebase client SDK for login
// Backend verifies the token afterward
await window.auth.signInWithEmailAndPassword(email, password);


BEFORE (signup.js):
const userCredential = await auth.createUserWithEmailAndPassword(email, tempPassword);
await user.sendEmailVerification();

AFTER:
try {
  const response = await api.signup(
    email, 
    tempPassword, 
    firstName, 
    middleName, 
    lastName, 
    birthday
  );
  
  showModal(
    "Account Created Successfully",
    `Temporary Password: ${response.data.tempPassword}<br>Check your email for verification link.`
  );
} catch (error) {
  showModal("Signup Error", error.message);
}


BEFORE (profile.js - save):
await firestore.collection("profiles").doc(uid).set(profileData);

AFTER:
try {
  const response = await api.profileSave(profileData);
  showAlert("Profile saved successfully!");
} catch (error) {
  showAlert("Error saving profile: " + error.message);
}


BEFORE (home.js - load profile):
const docSnap = await firestore.collection("profiles").doc(uid).get();

AFTER:
try {
  const response = await api.profileLoad();
  const data = response.data;
  // Use data to display on page
} catch (error) {
  console.error("Error loading profile:", error);
}


BEFORE (request.js - submit):
await firestore.collection("requests").add(requestData);

AFTER:
try {
  const response = await api.requestSubmit(
    selectedDocuments,
    purposes,
    notes,
    businessName,
    businessAddress,
    ownerName
  );
  showModal("Success", "Your request has been submitted!");
} catch (error) {
  showModal("Error", error.message);
}


BEFORE (request.js - load purposes):
const doc = await firestore.collection("document_purposes").doc("all").get();
allPurposes = doc.data();

AFTER:
try {
  const response = await api.getPurposes();
  allPurposes = response.data;
  // Populate dropdowns with purposes
} catch (error) {
  console.error("Failed to load purposes:", error);
  allPurposes = {};
}

*/
