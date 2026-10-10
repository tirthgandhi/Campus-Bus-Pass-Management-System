const mongoose = require("mongoose");

const busProblemSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    problemType: {
      type: String,
      enum: [
        "Engine Problem",
        "Brake Problem",
        "Tyre Problem",
        "Electrical Problem",
        "Fuel Problem",
        "Other"
      ],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusProblem", busProblemSchema);