const asyncHandler = require('../utils/asyncHandler');
const customerService = require('../services/customer.service');

const create = asyncHandler(async (req, res) => {
  const customer = await customerService.create(req.body, req.user);
  res.status(201).json({ success: true, data: customer });
});

const list = asyncHandler(async (req, res) => {
  const result = await customerService.list(req.query, req.user);
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const customer = await customerService.getById(req.params.id, req.user);
  res.json({ success: true, data: customer });
});

const update = asyncHandler(async (req, res) => {
  const customer = await customerService.update(req.params.id, req.body, req.user);
  res.json({ success: true, data: customer });
});

const remove = asyncHandler(async (req, res) => {
  await customerService.remove(req.params.id, req.user);
  res.json({ success: true, message: 'Customer deleted' });
});

const recordPurchase = asyncHandler(async (req, res) => {
  const customer = await customerService.recordPurchase(req.params.id, req.body, req.user);
  res.json({ success: true, data: customer });
});

const monthlySalesSummary = asyncHandler(async (req, res) => {
  const when = req.query.month ? new Date(req.query.month) : new Date();
  const data = await customerService.monthlySalesSummary(req.user, when);
  res.json({ success: true, data });
});

module.exports = { create, list, getById, update, remove, recordPurchase, monthlySalesSummary };
