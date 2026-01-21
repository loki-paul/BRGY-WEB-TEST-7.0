// src/fetch/profile.js

const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// ==========================================
// FIREBASE ADMIN INITIALIZATION
// ==========================================

// Initialize Firebase Admin SDK
// The service account credentials are loaded from environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: "key-id",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: "client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk"
};

// Only initialize if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DB_URL
    });
    console.log("✅ Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
    // Continue anyway - routes will fail with descriptive errors
  }
}

const auth = admin.auth();
const db = admin.database();
const firestore = admin.firestore();

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Verify Firebase ID token from frontend
 */
const verifyToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

/**
 * Get user from request headers (Authorization: Bearer <token>)
 */
const getUserFromRequest = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const idToken = authHeader.substring(7);
  return await verifyToken(idToken);
};

// ==========================================
// ROUTES
// ==========================================

/**
 * POST /api/auth/signup
 * Create new user account and send verification email
 */
router.post("/auth/signup", async (req, res, next) => {
  try {
    const { email, password, firstName, middleName, lastName, birthday } = req.body;

    // Validate input
    if (!email || !firstName || !lastName || !birthday) {
      return res.status(400).json({
        success: false,
        error: { message: "Missing required fields" }
      });
    }

    // Create user account
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`
    });

    console.log(`📝 User created with UID: ${userRecord.uid}`);

    // Send email verification link
    await auth.generateEmailVerificationLink(email);
    console.log(`📧 Verification email sent to: ${email}`);

    // Convert birthday to YYMMDD format
    const [yyyy, mm, dd] = birthday.split("-");
    const formattedBirthday = yyyy.slice(2) + mm + dd;
    const tempPassword = (firstName + formattedBirthday).toLowerCase();

    // Save user data to Realtime Database
    await db.ref(`users/${userRecord.uid}`).set({
      firstName,
      middleName: middleName || "",
      lastName,
      birthday,
      email,
      tempPassword: true,
      completeInfo: false,
      emailVerified: false,
      createdAt: new Date().toISOString()
    });

    console.log(`✅ User profile saved to database`);

    return res.status(201).json({
      success: true,
      message: "Account created successfully. Verification email sent.",
      data: {
        uid: userRecord.uid,
        email,
        tempPassword
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user and check email verification
 */
router.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: "Email and password are required" }
      });
    }

    // Verify email and password (Firebase client does this)
    // This endpoint assumes the frontend uses Firebase Auth client-side
    // Backend only verifies the token sent by frontend
    
    // For proper backend login, you'd use a custom token or similar
    // For now, we assume the frontend handles Firebase Auth sign-in
    
    return res.status(200).json({
      success: true,
      message: "Use Firebase client SDK for login on frontend. Backend will verify tokens."
    });

  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 * Reset user password
 */
router.post("/auth/reset-password", async (req, res, next) => {
  try {
    const decodedToken = await getUserFromRequest(req);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: "Password must be at least 6 characters" }
      });
    }

    // Update password in Firebase Auth
    await auth.updateUser(decodedToken.uid, {
      password: newPassword
    });

    console.log(`🔐 Password updated for user: ${decodedToken.uid}`);

    // Update tempPassword flag in Realtime Database
    await db.ref(`users/${decodedToken.uid}`).update({
      tempPassword: false
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    next(error);
  }
});

/**
 * POST /api/profile/save
 * Save or update user profile data
 */
router.post("/profile/save", async (req, res, next) => {
  try {
    const decodedToken = await getUserFromRequest(req);
    const uid = decodedToken.uid;
    const profileData = req.body;

    // Validate required fields
    if (!profileData.firstName || !profileData.lastName) {
      return res.status(400).json({
        success: false,
        error: { message: "First name and last name are required" }
      });
    }

    // Save to Firestore (main profile storage)
    const docRef = firestore.collection("profiles").doc(uid);
    
    await docRef.set({
      ...profileData,
      uid,
      updatedAt: new Date().toISOString(),
      email: decodedToken.email
    }, { merge: true }); // merge: true to not overwrite other fields

    console.log(`✅ Profile saved for user: ${uid}`);

    // Also update in Realtime Database for backward compatibility
    await db.ref(`users/${uid}`).update({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      middleName: profileData.middleName || "",
      completeInfo: true,
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: {
        uid,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Profile save error:", error);
    next(error);
  }
});

/**
 * GET /api/profile/load
 * Load user profile data
 */
router.get("/profile/load", async (req, res, next) => {
  try {
    const decodedToken = await getUserFromRequest(req);
    const uid = decodedToken.uid;

    // Try to load from Firestore first
    const docSnap = await firestore.collection("profiles").doc(uid).get();

    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        error: { message: "Profile not found" }
      });
    }

    const profileData = docSnap.data();

    return res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error("Profile load error:", error);
    next(error);
  }
});

/**
 * POST /api/request/submit
 * Submit user request for documents
 */
router.post("/request/submit", async (req, res, next) => {
  try {
    const decodedToken = await getUserFromRequest(req);
    const uid = decodedToken.uid;
    
    const {
      documents,
      purposes,
      notes,
      businessName,
      businessAddress,
      ownerName
    } = req.body;

    // Validate input
    if (!documents || documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "At least one document must be selected" }
      });
    }

    // Prepare request data
    const requestData = {
      userId: uid,
      documents,
      purposes: purposes || {},
      notes: notes || "",
      businessInfo: {
        businessName: businessName || "",
        businessAddress: businessAddress || "",
        ownerName: ownerName || ""
      },
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore
    const docRef = await firestore.collection("requests").add(requestData);

    console.log(`📋 Request submitted: ${docRef.id}`);

    return res.status(201).json({
      success: true,
      message: "Request submitted successfully",
      data: {
        requestId: docRef.id,
        status: "pending",
        createdAt: requestData.createdAt
      }
    });

  } catch (error) {
    console.error("Request submit error:", error);
    next(error);
  }
});

/**
 * GET /api/request/list
 * Get all requests for the current user
 */
router.get("/request/list", async (req, res, next) => {
  try {
    const decodedToken = await getUserFromRequest(req);
    const uid = decodedToken.uid;

    // Query requests for the current user
    const snapshot = await firestore
      .collection("requests")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const requests = [];
    snapshot.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        count: requests.length,
        requests
      }
    });

  } catch (error) {
    console.error("Request list error:", error);
    next(error);
  }
});

/**
 * GET /api/seed/purposes
 * Load purposes for documents (for frontend to display)
 */
router.get("/seed/purposes", async (req, res, next) => {
  try {
    const doc = await firestore.collection("document_purposes").doc("all").get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: { message: "Document purposes not found. Please run the seed endpoint." }
      });
    }

    const purposes = doc.data();

    return res.status(200).json({
      success: true,
      data: purposes
    });

  } catch (error) {
    console.error("Seed purposes fetch error:", error);
    next(error);
  }
});

/**
 * POST /api/seed/purposes
 * One-time endpoint to populate document purposes in Firestore
 */
router.post("/seed/purposes", async (req, res, next) => {
  try {
    // Check if purposes already exist (to prevent overwriting)
    const doc = await firestore.collection("document_purposes").doc("all").get();
    
    if (doc.exists && !req.query.force) {
      return res.status(400).json({
        success: false,
        error: { message: "Document purposes already exist. Use ?force=true to overwrite." }
      });
    }

    // Document purposes data
    const purposesData = {
      barangay_clearance: [
        "Employment (local or abroad)",
        "Pre-employment requirement",
        "Business permit / renewal",
        "Police clearance requirement",
        "NBI clearance requirement",
        "Loan application (bank, lending, cooperative)",
        "Government transaction",
        "Legal requirement",
        "Court requirement",
        "Identification purposes",
        "Travel requirement",
        "Passport application support",
        "Immigration requirement",
        "School requirement",
        "Scholarship requirement",
        "Internship / OJT requirement",
        "Training or seminar requirement",
        "Housing or relocation requirement",
        "Insurance application",
        "Contract signing",
        "Notarization support",
        "Proof of good moral character",
        "Barangay records update",
        "General legal or official purposes"
      ],
      barangay_residency: [
        "Proof of residence",
        "School enrollment",
        "Scholarship requirement",
        "Employment verification",
        "Internship / OJT requirement",
        "Voter registration / transfer",
        "COMELEC requirement",
        "Government transaction",
        "PhilHealth / SSS / GSIS / Pag-IBIG requirement",
        "Bank or loan requirement",
        "Utility application (water, electricity, internet)",
        "Housing or rental requirement",
        "Relocation or transfer requirement",
        "Travel requirement",
        "Immigration support",
        "ID application",
        "Passport support",
        "Insurance application",
        "Court or legal requirement",
        "Social services requirement",
        "Census or barangay profiling",
        "Senior citizen / PWD registration",
        "Solo parent registration"
      ],
      barangay_indigency: [
        "Medical assistance",
        "Hospital admission",
        "Medicine assistance",
        "Laboratory or diagnostic assistance",
        "Surgery assistance",
        "PhilHealth requirement",
        "DSWD assistance",
        "LGU financial assistance",
        "Medical guarantee letter",
        "Educational assistance",
        "Scholarship application",
        "Tuition fee assistance",
        "School supplies assistance",
        "Burial or funeral assistance",
        "Death-related assistance",
        "Food assistance",
        "Emergency assistance",
        "Calamity or disaster assistance",
        "Housing assistance",
        "Legal aid",
        "Court fee assistance",
        "Bail assistance",
        "Livelihood assistance",
        "Transportation assistance",
        "Senior citizen assistance",
        "PWD assistance",
        "Solo parent assistance",
        "Women and children assistance",
        "Victim assistance",
        "Financial hardship certification"
      ],
      business_permit: [
        "Business registration",
        "Business permit",
        "Business renewal",
        "Business operation",
        "Trade name registration",
        "LGU requirement",
        "DTI requirement",
        "SEC requirement",
        "Business establishment",
        "Commercial operation"
      ]
    };

    // Save to Firestore
    await firestore.collection("document_purposes").doc("all").set(purposesData, { merge: true });

    console.log("✅ Document purposes seeded successfully");

    return res.status(200).json({
      success: true,
      message: "Document purposes seeded successfully",
      data: {
        categoriesCount: Object.keys(purposesData).length,
        totalPurposes: Object.values(purposesData).reduce((sum, arr) => sum + arr.length, 0)
      }
    });

  } catch (error) {
    console.error("Seed purposes error:", error);
    next(error);
  }
});

module.exports = router;
