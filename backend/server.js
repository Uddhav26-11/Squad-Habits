require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const passport = require("./config/passport");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize());

app.use("/auth", require("./routes/authRoutes"));
app.use("/squad", require("./routes/squadRoutes"));
app.use("/habit", require("./routes/habitRoutes"));

// API health check (moved to /api/health so it doesn't block the frontend at "/")
app.get("/api/health", (req, res) => {
  res.json({ message: "Squad Habits API is running" });
});

// Serve the built frontend (frontend/dist) in production
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// Only these exact backend paths should be excluded from the SPA catch-all.
// Previously the whole "/auth" prefix was excluded, which also blocked the
// frontend's own /auth/callback page (used after Google OAuth redirect),
// causing "Cannot GET /auth/callback" (404) after Google login.
const BACKEND_ONLY_PATHS = [
  "/auth/google",
  "/auth/google/callback",
  "/auth/register",
  "/auth/login",
  "/auth/me",
  "/auth/logout",
];

app.get(/^(?!\/(squad|habit|api)).*/, (req, res, next) => {
  if (BACKEND_ONLY_PATHS.includes(req.path)) {
    return next();
  }
  res.sendFile(path.join(frontendDist, "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("MongoDB connection error:", err));