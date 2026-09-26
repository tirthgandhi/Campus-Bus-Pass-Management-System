const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

// Load .env FIRST. Support both local backend/.env and a repository-root .env.
dotenv.config({
    path: path.join(__dirname, ".env")
});

dotenv.config({
    path: path.join(__dirname, "..", ".env")
});

// Require files AFTER .env is loaded
const connectDB = require("./common/config/db");
const authRoutes = require("./common/authRoutes");
const adminRoutes = require("./admin/adminRoutes");
const driverRoutes = require("./driver/driverRoutes");
const studentRoutes = require("./student/studentRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/student", studentRoutes);

// ── Health Check ──────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        message: "Campus Bus Backend is running"
    });
});

// ── Start Server ──────────────────────────────────────────────────────
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};

startServer();
