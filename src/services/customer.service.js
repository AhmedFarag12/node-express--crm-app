const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');
const { buildPagination, paginatedResponse } = require('../utils/pagination');
const { startOfMonth, endOfMonth } = require('../utils/dates');

const buildScope = (user) => {
  if (!user) return {};
  if (user.role === 'admin') return {};
  return { $or: [{ assignedTo: user._id }, { createdBy: user._id }] };
};

const create = async (data, currentUser) =>
  Customer.create({ ...data, createdBy: currentUser._id });

const list = async (query, currentUser) => {
  const { page, limit, skip } = buildPagination(query);
  const filter = { ...buildScope(currentUser) };
  if (query.status) filter.status = query.status;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { company: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Customer.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Customer.countDocuments(filter),
  ]);

  return paginatedResponse(items, total, { page, limit });
};

const getById = async (id, currentUser) => {
  const customer = await Customer.findById(id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email');
  if (!customer) throw ApiError.notFound('Customer not found');

  if (currentUser.role !== 'admin') {
    const ownsIt =
      String(customer.assignedTo?._id || customer.assignedTo) === String(currentUser._id) ||
      String(customer.createdBy?._id || customer.createdBy) === String(currentUser._id);
    if (!ownsIt) throw ApiError.forbidden('You cannot access this customer');
  }
  return customer;
};

const update = async (id, data, currentUser) => {
  await getById(id, currentUser);
  return Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const remove = async (id, currentUser) => {
  await getById(id, currentUser);
  return Customer.findByIdAndDelete(id);
};

const recordPurchase = async (id, { amount, purchasedAt }, currentUser) => {
  const customer = await getById(id, currentUser);
  customer.totalSpent = (customer.totalSpent || 0) + amount;
  customer.lastPurchaseAt = purchasedAt ? new Date(purchasedAt) : new Date();
  await customer.save();
  return customer;
};

const monthlySalesSummary = async (currentUser, when = new Date()) => {
  const match = { ...buildScope(currentUser) };
  match.lastPurchaseAt = { $gte: startOfMonth(when), $lte: endOfMonth(when) };

  const [agg] = await Customer.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalSpent' },
        customers: { $sum: 1 },
      },
    },
  ]);

  return {
    month: when.toISOString().slice(0, 7),
    revenue: agg?.revenue || 0,
    customers: agg?.customers || 0,
  };
};

module.exports = { create, list, getById, update, remove, recordPurchase, monthlySalesSummary };
