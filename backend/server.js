require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Support both backend/.env and repo-root .env
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("./common/config/db");

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes    = require("./common/routes/authRoutes");   // ✅ canonical path
const adminRoutes   = require("./admin/adminRoutes");
const driverRoutes  = require("./driver/driverRoutes");
const studentRoutes = require("./student/studentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/admin",   adminRoutes);
app.use("/api/driver",  driverRoutes);
app.use("/api/student", studentRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "🚌 Campus Bus Backend is running" });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
};

startServer();
