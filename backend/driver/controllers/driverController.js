const Bus = require("../../database/models/Bus");
const BusPass = require("../../database/models/BusPass");
const Attendance = require("../../database/models/Attendance");

const getMyBusPassengers = async (req, res) => {
    try {
        // Find the bus assigned to the logged-in driver
        const bus = await Bus.findOne({
            driver: req.user.userId,
            status: "active"
        });

        if (!bus) {
            return res.status(404).json({
                message: "No active bus assigned to this driver"
            });
        }

        // Find active bus passes for this bus
        const busPasses = await BusPass.find({
            bus: bus._id,
            status: "active"
        }).populate(
            "student",
            "name email"
        );

        res.json({
            bus: {
                id: bus._id,
                busNumber: bus.busNumber,
                registrationNumber: bus.registrationNumber
            },
            passengers: busPasses
        });

    } catch (error) {
        console.error("❌ Get driver passengers error:", error.message);

        res.status(500).json({
            message: "Server error while getting passengers"
        });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { studentId, status } = req.body;

        if (!studentId || !["present", "absent"].includes(status)) {
            return res.status(400).json({
                message: "studentId and valid status are required"
            });
        }

        // Find the driver's active bus
        const bus = await Bus.findOne({
            driver: req.user.userId,
            status: "active"
        });

        if (!bus) {
            return res.status(404).json({
                message: "No active bus assigned to this driver"
            });
        }

        // Make sure the student is actually a passenger on this bus
        const busPass = await BusPass.findOne({
            student: studentId,
            bus: bus._id,
            status: "active"
        });

        if (!busPass) {
            return res.status(404).json({
                message: "Student is not an active passenger on this bus"
            });
        }

        // Use today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOneAndUpdate(
            {
                student: studentId,
                bus: bus._id,
                date: today
            },
            {
                student: studentId,
                bus: bus._id,
                driver: req.user.userId,
                date: today,
                status
            },
            {
                new: true,
                upsert: true
            }
        );

        res.json({
            message: `Student marked ${status}`,
            attendance
        });

    } catch (error) {
        console.error("❌ Mark attendance error:", error.message);

        res.status(500).json({
            message: "Server error while marking attendance"
        });
    }
};

const getTodayAttendance = async (req, res) => {
    try {
        const bus = await Bus.findOne({
            driver: req.user.userId,
            status: "active"
        });

        if (!bus) {
            return res.status(404).json({
                message: "No active bus assigned to this driver"
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const attendance = await Attendance.find({
            bus: bus._id,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate("student", "name email");

        res.json({
            bus: {
                id: bus._id,
                busNumber: bus.busNumber
            },
            date: today,
            attendance
        });

    } catch (error) {
        console.error("❌ Get attendance error:", error.message);

        res.status(500).json({
            message: "Server error while getting attendance"
        });
    }
};

module.exports = {
    getMyBusPassengers,
    markAttendance,
    getTodayAttendance
};
