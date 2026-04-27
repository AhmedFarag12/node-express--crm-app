const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/token');
const User = require('../models/User');

const auth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(ApiError.unauthorized('Authorization token is missing'));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(ApiError.unauthorized('User no longer exists or is inactive'));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
