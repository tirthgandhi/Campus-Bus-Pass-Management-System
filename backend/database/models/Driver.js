const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    driverId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    assignedBus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      default: null
    },
    assignedRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusRoute",
      default: null
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);