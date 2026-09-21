const mongoose = require("mongoose");

const busProblemSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    problemType: {
      type: String,
      enum: ["breakdown", "engine", "tyre", "electrical", "other"],
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    reportedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["reported", "under_review", "resolved"],
      default: "reported",
      required: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const BusProblem = mongoose.model("BusProblem", busProblemSchema);

module.exports = BusProblem;
