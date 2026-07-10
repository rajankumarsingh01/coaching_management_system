const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/token');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Access token missing'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired access token'));
  }
};

module.exports = authMiddleware;