const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    capacity: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bus", busSchema);