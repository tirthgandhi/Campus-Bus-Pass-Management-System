// Preserve the previous import path without maintaining a competing controller.
const { createRoute, getRoutes, getRouteById, updateRoute, deleteRoute } = require('./adminController');
module.exports = { createRoute, getRoutes, getRouteById, updateRoute, deleteRoute };
