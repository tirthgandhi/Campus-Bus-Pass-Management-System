const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },

        transactionId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },

        paymentDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);