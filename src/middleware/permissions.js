const ApiError = require('../utils/ApiError');

const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  next();
};

const isAdmin = allowRoles('admin');
const isAdminOrSales = allowRoles('admin', 'sales');

module.exports = { allowRoles, isAdmin, isAdminOrSales };
