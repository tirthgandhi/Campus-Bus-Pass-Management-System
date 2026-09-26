const TransportRequest = require("../../database/models/TransportRequest");
const Student = require("../../database/models/Student");
const PickupPoint = require("../../database/models/PickupPoint");
const Route = require("../../database/models/Route");

const applyForPass = async (req, res) => {
    try {
        const { pickupPointId, requestedRouteId } = req.body;

        if (!pickupPointId || !requestedRouteId) {
            return res.status(400).json({
                message: "pickupPointId and requestedRouteId are required"
            });
        }

        const student = await Student.findOne({ userId: req.user.userId });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const pickupPoint = await PickupPoint.findById(pickupPointId);
        if (!pickupPoint) {
            return res.status(404).json({
                message: "Pickup point not found"
            });
        }

        const route = await Route.findById(requestedRouteId);
        if (!route) {
            return res.status(404).json({
                message: "Route not found"
            });
        }

        const existingRequest = await TransportRequest.findOne({
            student: student._id,
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "You already have a pending transport request"
            });
        }

        const request = await TransportRequest.create({
            student: student._id,
            pickupPoint: pickupPointId,
            requestedRoute: requestedRouteId,
            status: "pending"
        });

        return res.status(201).json({
            message: "Transport request submitted successfully",
            request
        });

    } catch (error) {
        console.error("❌ Apply for pass error:", error.message);

        return res.status(500).json({
            message: "Server error while applying for transport"
        });
    }
};

const getMyPasses = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user.userId });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const requests = await TransportRequest.find({
            student: student._id
        })
            .populate("pickupPoint")
            .populate("requestedRoute")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("❌ Get passes error:", error.message);

        return res.status(500).json({
            message: "Server error while fetching transport requests"
        });
    }
};

module.exports = {
    applyForPass,
    getMyPasses
};
