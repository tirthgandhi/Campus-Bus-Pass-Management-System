const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
    {
        busNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        capacity: {
            type: Number,
            required: true,
            min: 1
        },

        driverName: {
            type: String,
            trim: true,
            default: null
        },
        
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        status: {
            type: String,
            enum: ["active", "inactive", "maintenance"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Bus", busSchema);