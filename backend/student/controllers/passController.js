const BusPass = require("../../database/models/BusPass");

// Apply for a bus pass (transport request)
const applyForPass = async (req, res) => {
    try {
        const existingPass = await BusPass.findOne({
            user: req.user.userId,
            status: { $in: ["pending", "approved"] }
        });

        if (existingPass) {
            return res.status(400).json({
                message: "You already have an active or pending bus pass"
            });
        }

        const pass = await BusPass.create({
            user: req.user.userId,
            status: "pending"
        });

        res.status(201).json({
            message: "Bus pass application submitted successfully",
            pass
        });

    } catch (error) {
        console.error("❌ Apply for pass error:", error.message);

        res.status(500).json({
            message: "Server error while applying for bus pass"
        });
    }
};


// Get logged-in student's passes
const getMyPasses = async (req, res) => {
    try {
        const passes = await BusPass.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            count: passes.length,
            passes
        });

    } catch (error) {
        console.error("❌ Get passes error:", error.message);

        res.status(500).json({
            message: "Server error while fetching passes"
        });
    }
};


module.exports = {
    applyForPass,
    getMyPasses
};
