const BusPass = require("../../database/models/BusPass");
const Bus = require("../../database/models/Bus");
const User = require("../../database/models/User");

// Create a bus
const createBus = async (req, res) => {
    try {
        const {
            busNumber,
            registrationNumber,
            capacity,
            driverName
        } = req.body;

        if (!busNumber || !registrationNumber || !capacity) {
            return res.status(400).json({
                message: "Bus number, registration number and capacity are required"
            });
        }

        const existingBus = await Bus.findOne({
            $or: [
                { busNumber },
                { registrationNumber }
            ]
        });

        if (existingBus) {
            return res.status(400).json({
                message: "Bus number or registration number already exists"
            });
        }

        const bus = await Bus.create({
            busNumber,
            registrationNumber,
            capacity,
            driverName
        });

        res.status(201).json({
            message: "Bus created successfully",
            bus
        });

    } catch (error) {
        console.error("❌ Create bus error:", error.message);

        res.status(500).json({
            message: "Server error while creating bus"
        });
    }
};


// Get all buses
const getBuses = async (req, res) => {
    try {
        const buses = await Bus.find().sort({ createdAt: -1 });

        res.status(200).json({
            count: buses.length,
            buses
        });

    } catch (error) {
        console.error("❌ Get buses error:", error.message);

        res.status(500).json({
            message: "Server error while fetching buses"
        });
    }
};


// Get one bus
const getBusById = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        res.status(200).json({
            bus
        });

    } catch (error) {
        console.error("❌ Get bus error:", error.message);

        res.status(500).json({
            message: "Server error while fetching bus"
        });
    }
};


// Update a bus
const updateBus = async (req, res) => {
    try {
        const bus = await Bus.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        res.status(200).json({
            message: "Bus updated successfully",
            bus
        });

    } catch (error) {
        console.error("❌ Update bus error:", error.message);

        res.status(500).json({
            message: "Server error while updating bus"
        });
    }
};


// Delete a bus
const deleteBus = async (req, res) => {
    try {
        const bus = await Bus.findByIdAndDelete(req.params.id);

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        res.status(200).json({
            message: "Bus deleted successfully"
        });

    } catch (error) {
        console.error("❌ Delete bus error:", error.message);

        res.status(500).json({
            message: "Server error while deleting bus"
        });
    }
};

const getPendingPasses = async (req, res) => {
    try {
        const passes = await BusPass
            .find({ status: "pending" })
            .populate("user", "name email role");

        res.status(200).json({
            count: passes.length,
            passes
        });

    } catch (error) {
        console.error("❌ Get pending passes error:", error.message);

        res.status(500).json({
            message: "Server error while fetching pending passes"
        });
    }
};


const approvePass = async (req, res) => {
    try {
        const pass = await BusPass.findById(req.params.id);

        if (!pass) {
            return res.status(404).json({
                message: "Bus pass not found"
            });
        }

        if (pass.status !== "pending") {
            return res.status(400).json({
                message: `Pass is already ${pass.status}`
            });
        }

        pass.status = "approved";

        await pass.save();

        const updatedPass = await BusPass
            .findById(pass._id)
            .populate("user", "name email role");

        res.status(200).json({
            message: "Bus pass approved successfully",
            busPass: updatedPass
        });

    } catch (error) {
        console.error("❌ Approve pass error:", error.message);

        res.status(500).json({
            message: "Server error while approving pass"
        });
    }
};


const rejectPass = async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        const pass = await BusPass.findById(req.params.id);

        if (!pass) {
            return res.status(404).json({
                message: "Bus pass not found"
            });
        }

        if (pass.status !== "pending") {
            return res.status(400).json({
                message: `Pass is already ${pass.status}`
            });
        }

        pass.status = "rejected";

        await pass.save();

        const updatedPass = await BusPass
            .findById(pass._id)
            .populate("user", "name email role");

        res.status(200).json({
            message: "Bus pass rejected successfully",
            busPass: updatedPass
        });

    } catch (error) {
        console.error("❌ Reject pass error:", error.message);

        res.status(500).json({
            message: "Server error while rejecting pass"
        });
    }
};

const assignRouteToPass = async (req, res) => {
    try {
        const { routeId } = req.body;

        if (!routeId) {
            return res.status(400).json({
                message: "Route ID is required"
            });
        }

        const pass = await BusPass.findById(req.params.id);

        if (!pass) {
            return res.status(404).json({
                message: "Bus pass not found"
            });
        }

        pass.route = routeId;

        await pass.save();

        const updatedPass = await BusPass
            .findById(pass._id)
            .populate("user", "name email role")
            .populate("route");

        res.status(200).json({
            message: "Route assigned to bus pass successfully",
            busPass: updatedPass
        });

    } catch (error) {
        console.error("❌ Assign route error:", error.message);

        res.status(500).json({
            message: "Server error while assigning route"
        });
    }
};

const assignDriverToBus = async (req, res) => {
    try {
        const { driverId } = req.body;

        if (!driverId) {
            return res.status(400).json({
                message: "driverId is required"
            });
        }

        const driver = await User.findOne({
            _id: driverId,
            role: "driver"
        });

        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        const bus = await Bus.findById(req.params.id);

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        bus.driver = driver._id;
        bus.driverName = driver.name;

        await bus.save();

        res.json({
            message: "Driver assigned to bus successfully",
            bus
        });

    } catch (error) {
        console.error("❌ Assign driver error:", error.message);

        res.status(500).json({
            message: "Server error while assigning driver"
        });
    }
};

module.exports = {
    createBus,
    getBuses,
    getBusById,
    updateBus,
    deleteBus,
    getPendingPasses,
    approvePass,
    rejectPass,
    assignRouteToPass,
    assignDriverToBus
};
