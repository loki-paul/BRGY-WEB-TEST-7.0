# Frontend to Backend Migration Guide

This guide explains how to update your frontend code to use the new backend API instead of calling Firebase directly.

## Step-by-Step Migration

### Step 1: Add API Helper to Frontend

1. Create a new file: `assets/js/api-helper.js`
2. Copy content from `backend/FRONTEND_INTEGRATION_SAMPLE.js`
3. Include in your HTML files before other scripts:

```html
<script src="assets/js/firebase-config.js"></script>
<script src="assets/js/api-helper.js"></script>
<script src="assets/js/index.js"></script>
```

### Step 2: Update Each Frontend File

#### **index.js (Login)**

**Change:** Nothing! Keep Firebase client SDK for authentication
- Frontend still handles the login UI/UX
- Backend just verifies the token after login

The flow:
1. User enters credentials → Frontend validates → Firebase Auth
2. User redirects to home page → Home page calls `api.profileLoad()`
3. Backend verifies token and loads profile

#### **signup.js (Account Creation)**

**Before:**
```javascript
const userCredential = await auth.createUserWithEmailAndPassword(email, tempPassword);
await user.sendEmailVerification();

await realtimeDB.ref("users/" + uid).set({
  firstName, lastName, email, tempPassword: true, ...
});
```

**After:**
```javascript
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
    `<b>Temporary Password:</b> ${response.data.tempPassword}<br><br>
     A verification link was sent to: ${email}`
  );
  
  // Clear form
  document.getElementById("createUserForm").reset();

} catch (error) {
  showModal("Signup Error", error.message);
}
```

#### **reset-password.js (Password Reset)**

**Before:**
```javascript
await user.updatePassword(newPassword);

await firebase.database()
  .ref("users/" + user.uid)
  .update({ tempPassword: false });
```

**After:**
```javascript
try {
  const response = await api.resetPassword(newPassword);
  showAlert("Password updated successfully!");
  window.location.href = "complete-form.html";
} catch (error) {
  showAlert("Error: " + error.message);
}
```

#### **profile.js (Complete Profile Form)**

**Before:**
```javascript
async function handleSubmit() {
  const profileData = collectFormData();

  await firestore.collection("profiles").doc(uid).set({
    ...profileData,
    email: user.email
  }, { merge: true });

  await realtimeDB.ref(`users/${uid}`).update({
    completeInfo: true,
    ...profileData
  });

  showAlert("Profile saved successfully!");
}
```

**After:**
```javascript
async function handleSubmit() {
  const profileData = collectFormData();

  try {
    const response = await api.profileSave(profileData);
    showAlert("Profile saved successfully!");
    window.location.href = "home.html";
  } catch (error) {
    showAlert("Error saving profile: " + error.message);
  }
}
```

#### **home.js (Load Profile)**

**Before:**
```javascript
async function loadBasicProfile(uid) {
  const docSnap = await firestore.collection("profiles").doc(uid).get();
  
  if (!docSnap.exists) return;

  const data = docSnap.data();
  
  profName.innerText = `${data.firstName} ${data.lastName}`;
  profPhone.innerText = data.phoneNumber || "Not provided";
  profEmail.innerText = data.email || "Not provided";
}
```

**After:**
```javascript
async function loadBasicProfile() {
  try {
    const response = await api.profileLoad();
    const data = response.data;
    
    profName.innerText = `${data.firstName} ${data.lastName}`;
    profPhone.innerText = data.phoneNumber || "Not provided";
    profEmail.innerText = data.email || "Not provided";
    
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

// Call this from auth state change handler
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  loadBasicProfile(); // No need to pass uid
});
```

#### **request.js (Document Request Submission)**

**Before:**
```javascript
async function loadPurposes() {
  const doc = await firebase.firestore()
    .collection("document_purposes")
    .doc("all")
    .get();
  
  if (doc.exists) {
    allPurposes = doc.data();
  }
}

// In form submission:
await firestore.collection("requests").add({
  userId: user.uid,
  documents,
  purposes,
  notes,
  status: "pending",
  createdAt: new Date().toISOString()
});
```

**After:**
```javascript
async function loadPurposes() {
  try {
    const response = await api.getPurposes();
    allPurposes = response.data;
    
    // Populate dropdowns with purposes
    populatePurposeDropdowns(allPurposes);
  } catch (error) {
    console.error("Failed to load purposes:", error);
    allPurposes = {};
  }
}

// In form submission:
try {
  const response = await api.requestSubmit(
    selectedDocuments,
    purposes,
    notes,
    businessName || "",
    businessAddress || "",
    ownerName || ""
  );

  showModal(
    "Request Submitted",
    `Your request has been submitted successfully!<br>
     Request ID: ${response.data.requestId}<br>
     Status: ${response.data.status}`
  );
  
  // Redirect back to home
  setTimeout(() => {
    window.location.href = "home.html";
  }, 2000);

} catch (error) {
  showModal("Error", error.message);
}
```

#### **sendOtp.js & verifyOtp.js**

These can be **removed or kept as-is**. They're part of an alternative sign-in flow (passwordless sign-in with email links).

Currently, your signup flow uses passwords. If you want to keep email-link verification:
- Keep these files for that flow
- Or remove them and only use the standard signup flow

**Current flow (keep using):**
1. Signup with email/password
2. Verify email (Firebase sends link)
3. Login with email/password

#### **seedPurposes.js**

**Before:**
```javascript
const db = firebase.firestore();
await db.collection("document_purposes").doc("all").set(data);
```

**After:**

This is now a backend endpoint. Call it once on initial setup:

```javascript
// In browser console or on a setup page:
await api.seedPurposes(false); // false = don't overwrite if exists
// or with force:
await api.seedPurposes(true); // true = overwrite existing
```

Or call it from HTML:
```html
<button onclick="seedPurposesOnce()">Seed Purposes (Admin Only)</button>

<script>
async function seedPurposesOnce() {
  try {
    const response = await api.seedPurposes(true);
    alert(`✅ Seeded ${response.data.totalPurposes} purposes`);
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
}
</script>
```

### Step 3: Update HTML Script Includes

Update your HTML files to include the API helper:

```html
<!-- Before -->
<script src="assets/js/firebase-config.js"></script>
<script src="assets/js/index.js"></script>

<!-- After -->
<script src="assets/js/firebase-config.js"></script>
<script src="assets/js/api-helper.js"></script>  <!-- ADD THIS -->
<script src="assets/js/index.js"></script>
```

### Step 4: Environment Configuration

Create development vs production URLs:

**In `api-helper.js`:**
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080/api'           // Development
  : 'https://your-railway-url.railway.app/api'; // Production
```

Update Railway URL after deployment.

### Step 5: Test Everything

1. **Local testing:**
   - Start backend: `cd backend && npm run dev`
   - Open frontend in browser
   - Test signup, login, profile save, request submission

2. **Production testing:**
   - Deploy backend to Railway
   - Update frontend API_BASE_URL
   - Deploy frontend
   - Full end-to-end test

### Step 6: Cleanup (Optional)

Once everything works, you can remove:
- ❌ `assets/js/sendOtp.js` (if not using email-link sign-in)
- ❌ `assets/js/verifyOtp.js` (if not using email-link sign-in)
- ❌ `seedPurposes.js` (replaced by backend endpoint)

Keep:
- ✅ `assets/js/firebase-config.js` (still needed for client auth)
- ✅ `assets/js/index.js` (still needed for login page)
- ✅ `assets/js/home.js`, `profile.js`, `request.js` (update these)

## Common Issues During Migration

### Issue: "User not authenticated" error

**Cause:** Backend is called before Firebase auth is ready

**Fix:** Ensure user is logged in before calling protected endpoints

```javascript
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    // Safe to call api.profileLoad() now
    const profile = await api.profileLoad();
  }
});
```

### Issue: "CORS error" when calling backend

**Cause:** Backend CORS configuration doesn't include your frontend URL

**Fix:** Update `src/app.js`:

```javascript
app.use(cors({
  origin: ["http://localhost:3000", "https://your-frontend-domain.com"],
  credentials: true
}));
```

### Issue: "Missing or invalid Authorization header"

**Cause:** Frontend not sending Firebase ID token

**Fix:** Check `api-helper.js` correctly extracts token:

```javascript
const user = firebase.auth().currentUser;
const idToken = user ? await user.getIdToken() : null;

headers['Authorization'] = `Bearer ${idToken}`;
```

### Issue: Backend returns "Token verification failed"

**Cause:** Token expired or user logged out

**Fix:** Force user to login again:

```javascript
const apiCall = async (...) => {
  // ... existing code ...
  
  if (response.status === 401) {
    // Token expired
    localStorage.clear();
    window.location.href = '/index.html';
  }
};
```

## Testing with Postman

### Test Signup

```
POST http://localhost:8080/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "firstName": "Juan",
  "lastName": "Cruz",
  "birthday": "1990-05-15"
}
```

### Test Profile Save (with token)

Get a test token from Firebase Console, then:

```
POST http://localhost:8080/api/profile/save
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Cruz",
  "phoneNumber": "09171234567",
  "completeAddress": "123 Main St, Barangay 186"
}
```

## Database Schema

Your databases will have this structure:

### Firestore:
```
profiles/{uid}
  - firstName
  - lastName
  - phoneNumber
  - completeAddress
  - yearsOfResidency
  - updatedAt
  
requests/{requestId}
  - userId
  - documents: ["barangay_clearance", ...]
  - purposes: { "barangay_clearance": "Employment", ... }
  - status: "pending"
  - createdAt
  
document_purposes/all
  - barangay_clearance: [...]
  - barangay_residency: [...]
  - barangay_indigency: [...]
  - business_permit: [...]
```

### Realtime Database:
```
users/{uid}
  - firstName
  - lastName
  - email
  - tempPassword
  - completeInfo
  - createdAt
```

---

✅ **Your frontend is now ready to use the backend!** Start with one file at a time to avoid breaking things.
