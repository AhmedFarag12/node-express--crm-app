const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/token');

const register = async (data) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw ApiError.conflict('Email is already in use');

  const password = await hashPassword(data.password);
  const user = await User.create({ ...data, password });

  const token = signToken({ id: user._id, role: user.role });
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (!user.isActive) throw ApiError.forbidden('Account is disabled');

  const ok = await comparePassword(password, user.password);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ id: user._id, role: user.role });
  user.password = undefined;
  return { user, token };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const ok = await comparePassword(currentPassword, user.password);
  if (!ok) throw ApiError.badRequest('Current password is incorrect');

  user.password = await hashPassword(newPassword);
  await user.save();
};

module.exports = { register, login, changePassword };
