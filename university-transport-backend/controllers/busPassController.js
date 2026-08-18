const BusPass = require("../models/BusPass");
const Payment = require("../models/Payment");
const Bus = require("../models/Bus");

const createBusPass = async (req, res) => {
    try {
        const { busId, validFrom, validUntil } = req.body;

        if (!busId || !validFrom || !validUntil) {
            return res.status(400).json({
                message: "busId, validFrom and validUntil are required"
            });
        }

        // Check that the bus exists
        const bus = await Bus.findById(busId);

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        // Find a successful payment made by this student
        const payment = await Payment.findOne({
            student: req.user.userId,
            paymentStatus: "paid"
        }).sort({ createdAt: -1 });

        if (!payment) {
            return res.status(400).json({
                message: "No successful payment found"
            });
        }

        // Check if student already has an active pass
        const existingPass = await BusPass.findOne({
            student: req.user.userId,
            status: "active"
        });

        if (existingPass) {
            return res.status(400).json({
                message: "Student already has an active bus pass",
                busPass: existingPass
            });
        }

        const passNumber = `PASS-${Date.now()}`;

        const busPass = await BusPass.create({
            student: req.user.userId,
            bus: busId,
            payment: payment._id,
            passNumber,
            validFrom,
            validUntil,
            status: "active"
        });

        res.status(201).json({
            message: "Bus pass created successfully",
            busPass
        });

    } catch (error) {
        console.error("❌ Create bus pass error:", error.message);

        res.status(500).json({
            message: "Server error while creating bus pass"
        });
    }
};


const getMyBusPass = async (req, res) => {
    try {
        const busPass = await BusPass.findOne({
            student: req.user.userId
        })
        .populate("bus")
        .populate("payment");

        if (!busPass) {
            return res.status(404).json({
                message: "No bus pass found"
            });
        }

        res.status(200).json({
            busPass
        });

    } catch (error) {
        console.error("❌ Get bus pass error:", error.message);

        res.status(500).json({
            message: "Server error while fetching bus pass"
        });
    }
};


module.exports = {
    createBusPass,
    getMyBusPass
};