// src/middlewares/error.middleware.js

/**
 * Global error handler middleware
 * Catches all errors and returns JSON response
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error properties
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Firebase-specific error handling
  if (err.code) {
    switch (err.code) {
      case "auth/email-already-exists":
        statusCode = 409;
        message = "Email is already registered.";
        break;
      case "auth/invalid-email":
        statusCode = 400;
        message = "Invalid email address.";
        break;
      case "auth/user-not-found":
        statusCode = 404;
        message = "User not found.";
        break;
      case "auth/wrong-password":
        statusCode = 401;
        message = "Incorrect password.";
        break;
      case "auth/weak-password":
        statusCode = 400;
        message = "Password is too weak.";
        break;
      case "permission-denied":
        statusCode = 403;
        message = "Permission denied. Check Firestore rules.";
        break;
      case "not-found":
        statusCode = 404;
        message = "Resource not found.";
        break;
      default:
        statusCode = 500;
        message = `Firebase error: ${err.code}`;
    }
  }

  // Send JSON error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || "UNKNOWN_ERROR"
    }
  });
};

module.exports = errorHandler;
