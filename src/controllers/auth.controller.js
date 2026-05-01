const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ success: true, data: { user, token } });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ success: true, data: { user, token } });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  res.json({ success: true, message: 'Password updated' });
});

const uploadMyAvatar = asyncHandler(async (req, res) => {
  const user = await userService.setAvatar(req.user._id, req.file);
  res.json({ success: true, data: user });
});

const removeMyAvatar = asyncHandler(async (req, res) => {
  const user = await userService.removeAvatar(req.user._id);
  res.json({ success: true, data: user });
});

module.exports = { register, login, me, changePassword, uploadMyAvatar, removeMyAvatar };
