# Barangay 186 Backend

Backend server for the Barangay 186 Management System built with Express.js and Firebase Admin SDK.

## Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── fetch/
│   │   └── profile.js         # All API routes & business logic
│   └── middlewares/
│       └── error.middleware.js # Global error handler
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── package.json              # Dependencies
├── railway.json              # Railway deployment config
└── README.md                 # This file
```

## Prerequisites

- Node.js 14+ installed
- Firebase project set up (Barangay 186 System)
- Firebase Service Account credentials
- npm or yarn package manager

## Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Environment Setup

1. **Get Firebase Service Account Credentials:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Copy the JSON content

2. **Create `.env` file:**
   ```
   PORT=8080
   NODE_ENV=development
   
   FIREBASE_PROJECT_ID=barangay-186-sys
   FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@barangay-186-sys.iam.gserviceaccount.com
   FIREBASE_DB_URL=https://barangay-186-sys-default-rtdb.firebaseio.com
   ```

   **Important:** 
   - The `FIREBASE_PRIVATE_KEY` must have escaped newlines: `\n` instead of actual line breaks
   - If copy-pasting from JSON, replace literal newlines with `\n`

## Running the Backend

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:8080`

**Health Check:**
```bash
curl http://localhost:8080/health
```

## API Endpoints

All endpoints require `Authorization: Bearer <firebaseIdToken>` header (except signup and seed purposes GET)

### Authentication

#### **POST /api/auth/signup**
Create new user account and send verification email.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "middleName": "M",
  "lastName": "Cruz",
  "birthday": "1990-05-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully. Verification email sent.",
  "data": {
    "uid": "user-uid-123",
    "email": "user@example.com",
    "tempPassword": "juanmay90"
  }
}
```

#### **POST /api/auth/login**
Frontend handles Firebase Auth login client-side. Backend verifies tokens.

**Note:** Use Firebase client SDK for login on frontend. This endpoint acknowledges token verification.

#### **POST /api/auth/reset-password**
Reset user password (requires authentication).

**Headers:**
```
Authorization: Bearer <firebaseIdToken>
```

**Request:**
```json
{
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Profile Management

#### **POST /api/profile/save**
Save or update user profile data.

**Headers:**
```
Authorization: Bearer <firebaseIdToken>
```

**Request:**
```json
{
  "firstName": "Juan",
  "middleName": "M",
  "lastName": "Cruz",
  "birthday": "1990-05-15",
  "email": "juan@example.com",
  "phoneNumber": "09171234567",
  "altPhone": "09181234567",
  "emergencyNumber": "09191234567",
  "placeOfBirth": "MANILA",
  "religion": "CATHOLIC",
  "occupation": "SOFTWARE ENGINEER",
  "employer": "TECH COMPANY",
  "completeAddress": "123 Main St, Barangay 186, Caloocan City",
  "yearsOfResidency": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile saved successfully",
  "data": {
    "uid": "user-uid-123",
    "updatedAt": "2025-01-21T10:30:00.000Z"
  }
}
```

#### **GET /api/profile/load**
Load user profile data.

**Headers:**
```
Authorization: Bearer <firebaseIdToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "user-uid-123",
    "firstName": "Juan",
    "lastName": "Cruz",
    "email": "juan@example.com",
    "phoneNumber": "09171234567",
    "completeAddress": "123 Main St, Barangay 186, Caloocan City",
    "yearsOfResidency": 5,
    "updatedAt": "2025-01-21T10:30:00.000Z"
  }
}
```

### Request Management

#### **POST /api/request/submit**
Submit user request for documents (Barangay Clearance, Residency, Indigency, Business Permit).

**Headers:**
```
Authorization: Bearer <firebaseIdToken>
```

**Request:**
```json
{
  "documents": ["barangay_clearance", "barangay_residency"],
  "purposes": {
    "barangay_clearance": "Employment (local or abroad)",
    "barangay_residency": "Proof of residence"
  },
  "notes": "Urgent needed for work",
  "businessName": "",
  "businessAddress": "",
  "ownerName": ""
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request submitted successfully",
  "data": {
    "requestId": "req-123456",
    "status": "pending",
    "createdAt": "2025-01-21T10:30:00.000Z"
  }
}
```

#### **GET /api/request/list**
Get all requests for current user.

**Headers:**
```
Authorization: Bearer <firebaseIdToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 2,
    "requests": [
      {
        "id": "req-123456",
        "userId": "user-uid-123",
        "documents": ["barangay_clearance"],
        "purposes": { "barangay_clearance": "Employment" },
        "status": "pending",
        "createdAt": "2025-01-21T10:30:00.000Z",
        "updatedAt": "2025-01-21T10:30:00.000Z"
      }
    ]
  }
}
```

### Document Purposes

#### **GET /api/seed/purposes**
Get all document purposes (no authentication required).

**Response:**
```json
{
  "success": true,
  "data": {
    "barangay_clearance": [
      "Employment (local or abroad)",
      "Pre-employment requirement",
      "Business permit / renewal",
      ...
    ],
    "barangay_residency": [...],
    "barangay_indigency": [...],
    "business_permit": [...]
  }
}
```

#### **POST /api/seed/purposes**
One-time endpoint to populate document purposes in Firestore (no authentication required).

**Query Parameters:**
- `force=true` - Overwrite existing purposes

**Response:**
```json
{
  "success": true,
  "message": "Document purposes seeded successfully",
  "data": {
    "categoriesCount": 4,
    "totalPurposes": 82
  }
}
```

## Frontend Integration

### 1. **Update Firebase Configuration**

In your frontend, update `firebase-config.js` to initialize only the client SDK:

```javascript
// frontend/assets/js/firebase-config.js
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "barangay-186-sys.firebaseapp.com",
  projectId: "barangay-186-sys",
  storageBucket: "barangay-186-sys.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

// Only client-side services
window.auth = firebase.auth();
window.firestore = firebase.firestore();
```

### 2. **Create API Helper**

Create `assets/js/api.js` for backend communication:

```javascript
// frontend/assets/js/api.js

const API_BASE_URL = "http://localhost:8080/api"; // Change for production

/**
 * Make API request with Firebase ID token
 */
async function apiCall(method, endpoint, body = null) {
  try {
    const user = firebase.auth().currentUser;
    const idToken = user ? await user.getIdToken() : null;

    const headers = {
      "Content-Type": "application/json"
    };

    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API error");
    }

    return data;

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Convenient methods
const api = {
  signup: (payload) => apiCall("POST", "/auth/signup", payload),
  resetPassword: (payload) => apiCall("POST", "/auth/reset-password", payload),
  profileSave: (payload) => apiCall("POST", "/profile/save", payload),
  profileLoad: () => apiCall("GET", "/profile/load"),
  requestSubmit: (payload) => apiCall("POST", "/request/submit", payload),
  requestList: () => apiCall("GET", "/request/list"),
  getPurposes: () => apiCall("GET", "/seed/purposes"),
  seedPurposes: (force = false) => apiCall("POST", `/seed/purposes?force=${force}`, {})
};
```

### 3. **Update Frontend Logic**

Replace Firebase calls with backend API calls:

```javascript
// Example: Signup
document.getElementById("createUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    email: document.getElementById("email").value.trim(),
    password: "TempPassword123", // Generate on backend
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    birthday: document.getElementById("birthday").value
  };

  try {
    const response = await api.signup(formData);
    showModal("Success", "Account created! Check your email for verification link.");
  } catch (error) {
    showModal("Error", error.message);
  }
});

// Example: Save Profile
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const profileData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    phoneNumber: document.getElementById("phoneNumber").value,
    completeAddress: document.getElementById("completeAddress").value
  };

  try {
    const response = await api.profileSave(profileData);
    showModal("Success", "Profile saved successfully!");
  } catch (error) {
    showModal("Error", error.message);
  }
});
```

## Deployment on Railway

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize Railway project:**
   ```bash
   railway init
   ```

4. **Set environment variables:**
   ```bash
   railway variables set PORT=8080
   railway variables set FIREBASE_PROJECT_ID=barangay-186-sys
   railway variables set FIREBASE_PRIVATE_KEY="your-private-key"
   railway variables set FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@barangay-186-sys.iam.gserviceaccount.com"
   railway variables set FIREBASE_DB_URL="https://barangay-186-sys-default-rtdb.firebaseio.com"
   railway variables set NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **View logs:**
   ```bash
   railway logs
   ```

## Error Handling

All errors return JSON responses with appropriate HTTP status codes:

```json
{
  "success": false,
  "error": {
    "message": "Invalid or expired token",
    "code": "AUTHENTICATION_ERROR"
  }
}
```

Common error codes:
- `400` - Bad Request (missing/invalid fields)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (permission denied)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (email already exists)
- `500` - Server Error

## Security Notes

1. **Always use HTTPS in production**
2. **Keep `.env` file in `.gitignore`** - Never commit secrets
3. **Validate all user input** on backend
4. **Use Firebase Security Rules** to protect database access
5. **Rotate Firebase service account credentials regularly**
6. **Enable Firebase authentication** for production

## Firebase Rules Example

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profiles - only accessible by owner
    match /profiles/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Requests - only accessible by owner
    match /requests/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Document purposes - readable by all authenticated users
    match /document_purposes/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only admin
    }
  }
}
```

**Realtime Database Rules:**
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## Troubleshooting

### Firebase Admin SDK not initializing
- Check `.env` file has correct credentials
- Verify `FIREBASE_PRIVATE_KEY` has escaped newlines (`\n`)
- Check Firebase project ID matches

### CORS errors
- Update CORS origins in `src/app.js`
- In production, set specific frontend domain instead of `*`

### Token verification failing
- Ensure frontend sends valid Firebase ID token in `Authorization` header
- Token format must be: `Bearer <idToken>`
- Check if token is expired

### Port already in use
- Change `PORT` in `.env` file
- Or kill existing process on port 8080

## Development Tips

1. **Test endpoints with Postman/Thunder Client:**
   - Set `Authorization` header: `Bearer YOUR_TEST_TOKEN`
   - Get test token from Firebase Console → Authentication

2. **Monitor server logs:**
   ```bash
   npm run dev
   ```

3. **Debug Firebase calls:**
   - Add console.logs in `src/fetch/profile.js`
   - Use Firebase Console to verify data

4. **Test locally first:**
   - Update frontend to use `http://localhost:8080` in development
   - Switch to production API URL for deployed backend

## License

ISC

## Support

For issues or questions, contact the development team.
