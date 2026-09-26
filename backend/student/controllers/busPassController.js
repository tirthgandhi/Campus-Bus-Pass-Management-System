const Student = require("../../database/models/Student");
const BusAssignment = require("../../database/models/BusAssignment");

const createBusPass = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user.userId });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const assignment = await BusAssignment.findOne({
            student: student._id,
            status: "active"
        })
            .populate("bus")
            .populate("route")
            .populate("pickupPoint");

        if (!assignment) {
            return res.status(404).json({
                message: "No active bus assignment found for this student"
            });
        }

        return res.status(200).json({
            message: "Bus pass details retrieved successfully",
            busPass: {
                busPassId: student.busPassId,
                assignedBus: student.assignedBus,
                assignedRoute: student.assignedRoute,
                pickupPoint: student.pickupPoint,
                assignment,
                transportStatus: student.transportStatus
            }
        });

    } catch (error) {
        console.error("❌ Create bus pass error:", error.message);

        return res.status(500).json({
            message: "Server error while retrieving bus pass"
        });
    }
};

const getMyBusPass = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user.userId });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const assignment = await BusAssignment.findOne({
            student: student._id,
            status: "active"
        })
            .populate("bus")
            .populate("route")
            .populate("pickupPoint");

        return res.status(200).json({
            busPass: {
                busPassId: student.busPassId,
                assignedBus: student.assignedBus,
                assignedRoute: student.assignedRoute,
                pickupPoint: student.pickupPoint,
                assignment,
                transportStatus: student.transportStatus
            }
        });

    } catch (error) {
        console.error("❌ Get bus pass error:", error.message);

        return res.status(500).json({
            message: "Server error while fetching bus pass"
        });
    }
};

module.exports = {
    createBusPass,
    getMyBusPass
};
