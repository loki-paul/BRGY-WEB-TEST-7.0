# 🚀 Getting Started Checklist

Use this checklist to set up your backend step-by-step.

## Phase 1: Setup (15 minutes)

### Firebase Credentials
- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Select project: **barangay-186-sys**
- [ ] Click ⚙️ **Project Settings**
- [ ] Go to **Service Accounts** tab
- [ ] Click **Generate New Private Key**
- [ ] Save the JSON file somewhere safe
- [ ] Copy values for `.env`

### Backend Configuration
- [ ] Open `backend/.env`
- [ ] Update `FIREBASE_PROJECT_ID` (from JSON: `project_id`)
- [ ] Update `FIREBASE_CLIENT_EMAIL` (from JSON: `client_email`)
- [ ] Update `FIREBASE_PRIVATE_KEY` (from JSON: `private_key`)
  - ⚠️ Replace actual newlines with `\n`
  - Example: `"-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAK...\n-----END RSA PRIVATE KEY-----\n"`
- [ ] Update `FIREBASE_DB_URL` (from JSON or Firebase Console)

### Install Dependencies
- [ ] Open terminal/PowerShell
- [ ] Navigate: `cd backend`
- [ ] Run: `npm install`
- [ ] Wait for all packages to install

### Start Backend
- [ ] Run: `npm run dev`
- [ ] Should see: `🚀 Server is running on http://localhost:8080`
- [ ] ✅ Backend is ready!

---

## Phase 2: Testing (10 minutes)

### Health Check
- [ ] Open browser: `http://localhost:8080/health`
- [ ] Should see: `{"status":"OK","message":"Backend is running"}`

### Test Endpoints (using Postman or Thunder Client)

#### Signup Endpoint
- [ ] Create new POST request
- [ ] URL: `http://localhost:8080/api/auth/signup`
- [ ] Headers: `Content-Type: application/json`
- [ ] Body:
  ```json
  {
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "firstName": "Juan",
    "middleName": "M",
    "lastName": "Cruz",
    "birthday": "1990-05-15"
  }
  ```
- [ ] Click Send
- [ ] Should get 201 response with `uid` and `tempPassword`

#### Seed Purposes Endpoint
- [ ] Create new POST request
- [ ] URL: `http://localhost:8080/api/seed/purposes`
- [ ] Click Send
- [ ] Should get 200 response with `totalPurposes: 82`

#### Get Purposes Endpoint
- [ ] Create new GET request
- [ ] URL: `http://localhost:8080/api/seed/purposes`
- [ ] Click Send
- [ ] Should see all document purposes in response

---

## Phase 3: Frontend Integration (30 minutes)

### Create API Helper
- [ ] Open `backend/FRONTEND_INTEGRATION_SAMPLE.js`
- [ ] Copy entire content
- [ ] Create new file: `assets/js/api-helper.js` in frontend
- [ ] Paste the code
- [ ] Update API_BASE_URL if needed for your domain

### Update HTML Files
- [ ] Open `index.html`
- [ ] Add script tag: `<script src="assets/js/api-helper.js"></script>`
- [ ] Do this for all HTML files that make API calls:
  - [ ] `index.html` (login)
  - [ ] `signup.html`
  - [ ] `reset-password.html`
  - [ ] `complete-form.html`
  - [ ] `home.html`
  - [ ] `request.html`

### Update Frontend Code

**signup.js:**
- [ ] Find: `await auth.createUserWithEmailAndPassword(email, tempPassword)`
- [ ] Replace with: `await api.signup(email, tempPassword, firstName, middleName, lastName, birthday)`
- [ ] Test signup flow

**profile.js:**
- [ ] Find: `await firestore.collection("profiles").doc(uid).set(...)`
- [ ] Replace with: `await api.profileSave(profileData)`
- [ ] Test profile saving

**home.js:**
- [ ] Find: `await firestore.collection("profiles").doc(uid).get()`
- [ ] Replace with: `await api.profileLoad()`
- [ ] Test profile loading

**request.js:**
- [ ] Find: `await firestore.collection("document_purposes").doc("all").get()`
- [ ] Replace with: `const response = await api.getPurposes(); allPurposes = response.data;`
- [ ] Find: `await firestore.collection("requests").add(...)`
- [ ] Replace with: `await api.requestSubmit(documents, purposes, notes, ...)`
- [ ] Test request submission

**reset-password.js:**
- [ ] Find: `await user.updatePassword(newPassword)`
- [ ] Replace with: `await api.resetPassword(newPassword)`
- [ ] Test password reset

### Test Frontend Flows
- [ ] Open frontend in browser (same domain/localhost)
- [ ] Test signup flow → should call backend
- [ ] Test profile save → should call backend
- [ ] Test request submission → should call backend
- [ ] Check browser console for API logs

---

## Phase 4: Production Deployment (20 minutes)

### Deploy Backend to Railway

- [ ] Install Railway CLI: `npm i -g @railway/cli`
- [ ] Open terminal in `backend` folder
- [ ] Run: `railway login`
- [ ] Follow login instructions
- [ ] Run: `railway init`
- [ ] Set project name and select region

### Set Environment Variables on Railway
```bash
railway variables set PORT=8080
railway variables set NODE_ENV=production
railway variables set FIREBASE_PROJECT_ID=barangay-186-sys
railway variables set FIREBASE_PRIVATE_KEY="your-key-with-escaped-newlines"
railway variables set FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@..."
railway variables set FIREBASE_DB_URL="https://barangay-186-sys-default-rtdb.firebaseio.com"
```

### Deploy
- [ ] Run: `railway up`
- [ ] Wait for deployment to complete
- [ ] Note the URL provided (e.g., `https://myapp.railway.app`)

### Update Frontend for Production
- [ ] Open `assets/js/api-helper.js`
- [ ] Update API_BASE_URL:
  ```javascript
  const API_BASE_URL = 'https://your-railway-url.railway.app/api';
  ```
- [ ] Save and test
- [ ] Deploy frontend

### Final Testing
- [ ] Test signup on production
- [ ] Test profile save on production
- [ ] Test request submission on production
- [ ] Check Railway logs: `railway logs`

---

## Phase 5: Maintenance Checklist

### Regular Tasks
- [ ] Monitor Railway logs weekly
- [ ] Check error rates in production
- [ ] Update dependencies: `npm update`
- [ ] Backup Firestore data
- [ ] Review Firebase usage/costs

### Before Each Deployment
- [ ] Test all endpoints locally
- [ ] Check `.env` values are correct
- [ ] Verify Firebase credentials still valid
- [ ] Test frontend-backend integration
- [ ] Check CORS settings updated

### Security
- [ ] Never commit `.env` to git
- [ ] Rotate Firebase service account keys annually
- [ ] Update node/npm regularly
- [ ] Monitor for security vulnerabilities: `npm audit`
- [ ] Set up Firebase Security Rules

---

## 🆘 Troubleshooting Checklist

### Backend Won't Start
- [ ] Check Node.js version: `node --version` (should be 14+)
- [ ] Check `.env` exists and has all values
- [ ] Check `FIREBASE_PRIVATE_KEY` has `\n` (not actual newlines)
- [ ] Delete `node_modules` and run `npm install` again
- [ ] Check for typos in `.env` values

### CORS Error on Frontend
- [ ] Check `src/app.js` has your frontend domain in CORS origins
- [ ] For localhost: ensure port matches (3000 vs 8080)
- [ ] Clear browser cache: `Ctrl+Shift+Del`
- [ ] Try incognito/private window

### Token Verification Failed
- [ ] Verify user is logged in to Firebase on frontend
- [ ] Check token is being sent in header
- [ ] Format: `Authorization: Bearer <token>`
- [ ] Token may be expired - try login again
- [ ] Check Firebase credentials in `.env` are correct

### Signup Not Working
- [ ] Check Firebase project allows user creation
- [ ] Check email format is valid
- [ ] Check password is strong enough (6+ chars)
- [ ] Check Firebase quotas/limits not reached
- [ ] Check server logs: `npm run dev` should show errors

### Profile Not Saving
- [ ] User must be logged in
- [ ] Required fields: firstName, lastName
- [ ] Check Firestore has correct rules
- [ ] Check user has permission to write to profiles collection

### Document Purposes Empty
- [ ] Run POST `/api/seed/purposes` once
- [ ] Check Firestore `document_purposes` collection exists
- [ ] Check `all` document has data

---

## 📱 Quick Reference

### Start Backend
```bash
cd backend
npm run dev
```

### Stop Backend
```bash
Ctrl + C
```

### Check Server
```bash
curl http://localhost:8080/health
```

### Deploy to Railway
```bash
cd backend
railway up
```

### Check Logs
```bash
railway logs
```

### View Environment Variables
```bash
railway variables list
```

---

## 💾 Files You Should Have

### Backend Files Created
- ✅ `backend/src/app.js`
- ✅ `backend/src/server.js`
- ✅ `backend/src/fetch/profile.js`
- ✅ `backend/src/middlewares/error.middleware.js`
- ✅ `backend/package.json`
- ✅ `backend/.env`
- ✅ `backend/.gitignore`
- ✅ `backend/railway.json`
- ✅ `backend/README.md`
- ✅ `backend/QUICK_START.md`
- ✅ `backend/MIGRATION_GUIDE.md`
- ✅ `backend/FRONTEND_INTEGRATION_SAMPLE.js`

### Frontend Files to Create/Update
- ✅ Create: `assets/js/api-helper.js`
- ✅ Update: `assets/js/signup.js`
- ✅ Update: `assets/js/profile.js`
- ✅ Update: `assets/js/home.js`
- ✅ Update: `assets/js/request.js`
- ✅ Update: `assets/js/reset-password.js`
- ✅ Update: All HTML files (add api-helper script tag)

---

## ✅ Completion Checklist

- [ ] Backend running locally at http://localhost:8080
- [ ] Health check works
- [ ] Signup endpoint tested
- [ ] Purposes seeded
- [ ] Frontend API helper created
- [ ] Frontend code updated
- [ ] Frontend-backend communication working
- [ ] Backend deployed to Railway
- [ ] Production endpoints tested
- [ ] Frontend updated with production API URL
- [ ] Documentation reviewed

---

## 🎉 You're All Set!

When all checks are complete, your Barangay 186 backend is fully operational!

**Next Step:** Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for an overview of everything that's been set up.

---

**Questions?** Check the relevant guide:
- **Setup issues** → Read [QUICK_START.md](./QUICK_START.md)
- **Frontend updates** → Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **API details** → Read [README.md](./README.md)
- **Code examples** → Check [FRONTEND_INTEGRATION_SAMPLE.js](./FRONTEND_INTEGRATION_SAMPLE.js)
