const mongoose = require("mongoose");

const pickupPointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
      default: "",
    },

    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    sequence: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },

    pickupTime: { type: String, trim: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },

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

pickupPointSchema.index({ route: 1, sequence: 1 }, { unique: true });
const PickupPoint = mongoose.model("PickupPoint", pickupPointSchema);

module.exports = PickupPoint;
