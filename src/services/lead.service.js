const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');
const { buildPagination, paginatedResponse } = require('../utils/pagination');

const buildScope = (user) => {
  if (!user) return {};
  if (user.role === 'admin') return {};
  return { $or: [{ assignedTo: user._id }, { createdBy: user._id }] };
};

const create = async (data, currentUser) =>
  Lead.create({ ...data, createdBy: currentUser._id });

const list = async (query, currentUser) => {
  const { page, limit, skip } = buildPagination(query);
  const filter = { ...buildScope(currentUser) };
  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { company: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Lead.countDocuments(filter),
  ]);

  return paginatedResponse(items, total, { page, limit });
};

const getById = async (id, currentUser) => {
  const lead = await Lead.findById(id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email')
    .populate('convertedToCustomer', 'name email');
  if (!lead) throw ApiError.notFound('Lead not found');

  if (currentUser.role !== 'admin') {
    const ownsIt =
      String(lead.assignedTo?._id || lead.assignedTo) === String(currentUser._id) ||
      String(lead.createdBy?._id || lead.createdBy) === String(currentUser._id);
    if (!ownsIt) throw ApiError.forbidden('You cannot access this lead');
  }
  return lead;
};

const update = async (id, data, currentUser) => {
  await getById(id, currentUser);
  return Lead.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const remove = async (id, currentUser) => {
  await getById(id, currentUser);
  return Lead.findByIdAndDelete(id);
};

const convertToCustomer = async (id, currentUser) => {
  const lead = await getById(id, currentUser);

  if (lead.convertedToCustomer) {
    throw ApiError.conflict('Lead is already converted to a customer');
  }

  const session = await mongoose.startSession();
  try {
    let customer;
    await session.withTransaction(async () => {
      [customer] = await Customer.create(
        [
          {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            status: 'active',
            convertedFromLead: lead._id,
            assignedTo: lead.assignedTo,
            createdBy: currentUser._id,
          },
        ],
        { session }
      );

      lead.status = 'won';
      lead.convertedToCustomer = customer._id;
      await lead.save({ session });
    });
    return { lead, customer };
  } catch (err) {
    if (err.message?.includes('Transaction numbers')) {
      const customer = await Customer.create({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: 'active',
        convertedFromLead: lead._id,
        assignedTo: lead.assignedTo,
        createdBy: currentUser._id,
      });
      lead.status = 'won';
      lead.convertedToCustomer = customer._id;
      await lead.save();
      return { lead, customer };
    }
    throw err;
  } finally {
    session.endSession();
  }
};

const pipelineSummary = async (currentUser) => {
  const match = { ...buildScope(currentUser) };
  return Lead.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$estimatedValue' },
        weightedValue: {
          $sum: { $multiply: ['$estimatedValue', { $divide: ['$probability', 100] }] },
        },
      },
    },
    { $project: { _id: 0, status: '$_id', count: 1, totalValue: 1, weightedValue: 1 } },
    { $sort: { status: 1 } },
  ]);
};

module.exports = { create, list, getById, update, remove, convertToCustomer, pipelineSummary };
