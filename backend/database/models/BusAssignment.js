const mongoose = require("mongoose");

const busAssignmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    pickupPoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PickupPoint",
      required: true,
    },

    busPassId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BusAssignment = mongoose.model("BusAssignment", busAssignmentSchema);

module.exports = BusAssignment;
