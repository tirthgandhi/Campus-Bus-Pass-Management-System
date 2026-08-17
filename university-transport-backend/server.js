const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

// Load .env FIRST
dotenv.config({
    path: path.join(__dirname, "..", ".env")
});

// Require files AFTER .env is loaded
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const routeRoutes = require("./routes/routeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const busPassRoutes = require("./routes/busPassRoutes");
const driverRoutes = require("./routes/driverRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/routes", routeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/buspasses", busPassRoutes);
app.use("/api/driver", driverRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Campus Bus Backend is running"
    });
});

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};

startServer();