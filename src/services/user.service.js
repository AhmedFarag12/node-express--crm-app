const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/password');
const { buildPagination, paginatedResponse } = require('../utils/pagination');
const { uploadAvatar, deleteAvatar } = require('../config/storage');

const create = async (data) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw ApiError.conflict('Email is already in use');

  const password = await hashPassword(data.password);
  return User.create({ ...data, password });
};

const list = async (query) => {
  const { page, limit, skip } = buildPagination(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (typeof query.isActive === 'boolean') filter.isActive = query.isActive;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return paginatedResponse(items, total, { page, limit });
};

const getById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

const update = async (id, data) => {
  if (data.email) {
    const exists = await User.findOne({ email: data.email, _id: { $ne: id } });
    if (exists) throw ApiError.conflict('Email is already in use');
  }
  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

const remove = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.avatar && user.avatar.publicId) {
    await deleteAvatar(user.avatar.publicId);
  }
  return user;
};

const setAvatar = async (id, file) => {
  if (!file || !file.buffer) throw ApiError.badRequest('No image file provided');

  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  const stored = await uploadAvatar(file.buffer, file.mimetype);

  if (user.avatar && user.avatar.publicId) {
    await deleteAvatar(user.avatar.publicId);
  }

  user.avatar = stored;
  await user.save();
  return user;
};

const removeAvatar = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  if (user.avatar && user.avatar.publicId) {
    await deleteAvatar(user.avatar.publicId);
  }
  user.avatar = undefined;
  await user.save();
  return user;
};

module.exports = { create, list, getById, update, remove, setAvatar, removeAvatar };
