// src/app.js

const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");
const profileRoutes = require("./fetch/profile");

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

// Enable CORS - allow frontend to communicate with backend
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:8080", "*"], // Update this in production
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

// ==========================================
// ROUTES
// ==========================================

// Mount all routes from profile.js
app.use("/api", profileRoutes);

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      path: req.path
    }
  });
});

// ==========================================
// ERROR HANDLER (MUST BE LAST)
// ==========================================

app.use(errorHandler);

module.exports = app;
