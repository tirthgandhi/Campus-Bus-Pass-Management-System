const { authorize } = require('./authMiddleware');
module.exports = { authorizeRoles: authorize };
