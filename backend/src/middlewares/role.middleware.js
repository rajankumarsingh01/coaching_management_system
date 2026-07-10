const ApiError = require('../utils/ApiError');
const { ROLES } = require('../config/constants');

// super_admin automatically bypasses any allowedRoles check — platform owner
// always has access, on top of whatever specific roles are listed.
const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }

  if (req.user.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }

  next();
};

module.exports = roleMiddleware;