const asyncHandler = require('../utils/asyncHandler');
const leadService = require('../services/lead.service');

const create = asyncHandler(async (req, res) => {
  const lead = await leadService.create(req.body, req.user);
  res.status(201).json({ success: true, data: lead });
});

const list = asyncHandler(async (req, res) => {
  const result = await leadService.list(req.query, req.user);
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const lead = await leadService.getById(req.params.id, req.user);
  res.json({ success: true, data: lead });
});

const update = asyncHandler(async (req, res) => {
  const lead = await leadService.update(req.params.id, req.body, req.user);
  res.json({ success: true, data: lead });
});

const remove = asyncHandler(async (req, res) => {
  await leadService.remove(req.params.id, req.user);
  res.json({ success: true, message: 'Lead deleted' });
});

const convertToCustomer = asyncHandler(async (req, res) => {
  const data = await leadService.convertToCustomer(req.params.id, req.user);
  res.status(201).json({ success: true, data });
});

const pipelineSummary = asyncHandler(async (req, res) => {
  const data = await leadService.pipelineSummary(req.user);
  res.json({ success: true, data });
});

module.exports = { create, list, getById, update, remove, convertToCustomer, pipelineSummary };
