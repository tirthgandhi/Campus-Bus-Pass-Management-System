const BusRoute = require("../models/BusRoute");
const Bus = require("../models/Bus");

const createRoute = async (req, res) => {
    try {
        const {
            routeName,
            routeNumber,
            startPoint,
            endPoint,
            stops,
            assignedBus
        } = req.body;

        if (!routeName || !routeNumber || !startPoint || !endPoint) {
            return res.status(400).json({
                message: "Route name, route number, start point and end point are required"
            });
        }

        const existingRoute = await BusRoute.findOne({ routeNumber });

        if (existingRoute) {
            return res.status(400).json({
                message: "Route number already exists"
            });
        }

        if (assignedBus) {
            const bus = await Bus.findById(assignedBus);

            if (!bus) {
                return res.status(404).json({
                    message: "Assigned bus not found"
                });
            }
        }

        const route = await BusRoute.create({
            routeName,
            routeNumber,
            startPoint,
            endPoint,
            stops: stops || [],
            assignedBus: assignedBus || null
        });

        res.status(201).json({
            message: "Route created successfully",
            route
        });

    } catch (error) {
        console.error("❌ Create route error:", error.message);

        res.status(500).json({
            message: "Server error while creating route"
        });
    }
};


const getRoutes = async (req, res) => {
    try {
        const routes = await BusRoute
            .find()
            .populate("assignedBus")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: routes.length,
            routes
        });

    } catch (error) {
        console.error("❌ Get routes error:", error.message);

        res.status(500).json({
            message: "Server error while fetching routes"
        });
    }
};


const updateRoute = async (req, res) => {
    try {
        const route = await BusRoute.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate("assignedBus");

        if (!route) {
            return res.status(404).json({
                message: "Route not found"
            });
        }

        res.status(200).json({
            message: "Route updated successfully",
            route
        });

    } catch (error) {
        console.error("❌ Update route error:", error.message);

        res.status(500).json({
            message: "Server error while updating route"
        });
    }
};


const deleteRoute = async (req, res) => {
    try {
        const route = await BusRoute.findByIdAndDelete(req.params.id);

        if (!route) {
            return res.status(404).json({
                message: "Route not found"
            });
        }

        res.status(200).json({
            message: "Route deleted successfully"
        });

    } catch (error) {
        console.error("❌ Delete route error:", error.message);

        res.status(500).json({
            message: "Server error while deleting route"
        });
    }
};


module.exports = {
    createRoute,
    getRoutes,
    updateRoute,
    deleteRoute
};