const mongoose = require("mongoose");

const busRouteSchema = new mongoose.Schema(
    {
        routeName: {
            type: String,
            required: true,
            trim: true
        },

        routeNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        startPoint: {
            type: String,
            required: true,
            trim: true
        },

        endPoint: {
            type: String,
            required: true,
            trim: true
        },

        stops: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true
                },

                sequence: {
                    type: Number,
                    required: true
                }
            }
        ],

        assignedBus: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            default: null
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("BusRoute", busRouteSchema);