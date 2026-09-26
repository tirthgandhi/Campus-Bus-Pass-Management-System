const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        if (!mongoUri) {
            throw new Error("MongoDB connection string is missing. Set MONGO_URI or MONGODB_URI in the environment.");
        }

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
        });

        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed");
        console.error(error.message);

        process.exit(1);
    }
};

module.exports = connectDB;
