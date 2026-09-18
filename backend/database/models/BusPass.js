const mongoose = require("mongoose");

const busPassSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        bus: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            required: true
        },

        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            required: true
        },

        passNumber: {
            type: String,
            unique: true,
            required: true
        },

        validFrom: {
            type: Date,
            required: true
        },

        validUntil: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["active", "expired", "cancelled"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("BusPass", busPassSchema);
