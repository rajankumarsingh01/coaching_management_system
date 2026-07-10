const { ROLES } = require('../config/constants');

// Attaches req.instituteFilter — super_admin sees everything (empty filter = cross-tenant),
// every other role gets strictly scoped to their own institute.
const tenantScope = (req, res, next) => {
  if (req.user.role === ROLES.SUPER_ADMIN) {
    req.instituteFilter = {};
  } else {
    req.instituteFilter = { instituteId: req.user.instituteId };
  }
  next();
};

module.exports = tenantScope;