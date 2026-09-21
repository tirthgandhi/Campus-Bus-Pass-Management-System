const mongoose = require("mongoose");

const transportRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    pickupPoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PickupPoint",
      required: true,
    },

    requestedRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    requestDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const TransportRequest = mongoose.model("TransportRequest", transportRequestSchema);

module.exports = TransportRequest;
