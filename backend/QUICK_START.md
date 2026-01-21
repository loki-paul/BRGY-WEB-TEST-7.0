# Quick Start Guide - Backend Setup

## 🚀 5-Minute Setup

### Step 1: Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **barangay-186-sys**
3. Click ⚙️ **Project Settings** (top-left)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file

### Step 2: Configure `.env`
Copy your Firebase service account JSON and update `.env`:

```bash
PORT=8080
NODE_ENV=development

FIREBASE_PROJECT_ID=barangay-186-sys
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@barangay-186-sys.iam.gserviceaccount.com
FIREBASE_DB_URL=https://barangay-186-sys-default-rtdb.firebaseio.com
```

**⚠️ Important:** Replace newlines in private key with `\n` (escaped newline, not actual line breaks)

### Step 3: Install & Run
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ You should see:
```
🚀 Server is running on http://localhost:8080
📡 Health check: http://localhost:8080/health
```

### Step 4: Verify Setup
```bash
curl http://localhost:8080/health
```

Should return:
```json
{"status":"OK","message":"Backend is running"}
```

## 📋 Testing Endpoints

### Using Postman/Thunder Client:

#### 1. Sign Up
```
POST http://localhost:8080/api/auth/signup
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPass123!",
  "firstName": "Juan",
  "lastName": "Cruz",
  "birthday": "1990-05-15"
}
```

#### 2. Get Document Purposes
```
GET http://localhost:8080/api/seed/purposes
```

#### 3. Seed Purposes (first time only)
```
POST http://localhost:8080/api/seed/purposes
```

Add `?force=true` to overwrite if already seeded:
```
POST http://localhost:8080/api/seed/purposes?force=true
```

## 🔗 Frontend Integration Quick Reference

### Update frontend API calls:

Before (Firebase client-side):
```javascript
await auth.createUserWithEmailAndPassword(email, password);
```

After (Backend):
```javascript
const response = await fetch('http://localhost:8080/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, firstName, lastName, birthday })
});
```

### Get Firebase ID Token (on frontend):
```javascript
const user = firebase.auth().currentUser;
const idToken = await user.getIdToken();

// Use in API calls
fetch('http://localhost:8080/api/profile/save', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(profileData)
});
```

## 🚢 Deploy on Railway

### 1. Install Railway CLI
```bash
npm i -g @railway/cli
```

### 2. Login
```bash
railway login
```

### 3. Create Project
```bash
cd backend
railway init
```

### 4. Set Environment Variables
```bash
railway variables set FIREBASE_PROJECT_ID=barangay-186-sys
railway variables set FIREBASE_PRIVATE_KEY="your-private-key-with-escaped-newlines"
railway variables set FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@barangay-186-sys.iam.gserviceaccount.com
railway variables set FIREBASE_DB_URL=https://barangay-186-sys-default-rtdb.firebaseio.com
railway variables set NODE_ENV=production
```

### 5. Deploy
```bash
railway up
```

### 6. Get Production URL
```bash
railway variables list
```

Or check Railway Dashboard for your deployed app URL.

## 📂 Backend Structure

```
backend/
├── src/
│   ├── app.js                 # Express app & middlewares
│   ├── server.js              # Start server
│   ├── fetch/
│   │   └── profile.js         # ALL routes & Firebase logic
│   └── middlewares/
│       └── error.middleware.js # Error handling
├── .env                       # Secrets (don't commit!)
├── .gitignore                 # Ignore node_modules, .env
├── package.json              # Dependencies
├── railway.json              # Railway config
└── README.md                 # Full documentation
```

## 🔑 Available API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/signup` | ❌ | Create account |
| POST | `/api/auth/reset-password` | ✅ | Reset password |
| POST | `/api/profile/save` | ✅ | Save profile |
| GET | `/api/profile/load` | ✅ | Load profile |
| POST | `/api/request/submit` | ✅ | Submit request |
| GET | `/api/request/list` | ✅ | Get requests |
| GET | `/api/seed/purposes` | ❌ | Get purposes |
| POST | `/api/seed/purposes` | ❌ | Seed purposes |

✅ = Requires `Authorization: Bearer <firebaseIdToken>` header

## 🐛 Troubleshooting

### Server won't start
```
Error: Firebase initialization failed
```
→ Check `.env` file has correct Firebase credentials

### CORS error on frontend
```
Access to XMLHttpRequest has been blocked by CORS policy
```
→ Update `src/app.js` CORS origin to match your frontend URL

### Token verification error
```
Invalid or expired token
```
→ Make sure frontend sends valid Firebase ID token in header

### "Module not found: firebase-admin"
```bash
npm install  # Re-install dependencies
```

## 📚 Learn More

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Express.js Guide](https://expressjs.com/)
- [Railway Deployment](https://railway.app/docs)

---

✅ **Backend is ready to use!** Update your frontend to call these endpoints instead of using Firebase directly.
