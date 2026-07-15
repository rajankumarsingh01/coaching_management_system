const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/token');
const { ROLES } = require('../config/constants');
const Institute = require('../modules/institute/institute.model');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Access token missing'));
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired access token'));
  }

  req.user = decoded;

  // super_admin kisi institute se belong nahi karta — is check ki zarurat nahi
  if (decoded.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  // Institute block check — YEH har authenticated request pe chalta hai, sirf
  // login pe nahi. Isi se already-logged-in user bhi turant block ho jaata hai,
  // token valid hone ke bawajood.
  try {
    const institute = await Institute.findById(decoded.instituteId).select('isActive');
    if (!institute || institute.isActive === false) {
     return next(new ApiError(403, 'Institute access suspended. Contact your institute administrator.', [], 'INSTITUTE_SUSPENDED'));
    }
  } catch (err) {
    return next(new ApiError(500, 'Failed to verify institute status'));
  }

  next();
};

module.exports = authMiddleware;