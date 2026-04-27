const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const create = asyncHandler(async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json({ success: true, data: user });
});

const list = asyncHandler(async (req, res) => {
  const result = await userService.list(req.query);
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json({ success: true, data: user });
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  res.json({ success: true, data: user });
});

const remove = asyncHandler(async (req, res) => {
  await userService.remove(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { create, list, getById, update, remove };
