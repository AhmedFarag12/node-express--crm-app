const Joi = require('joi');
const { objectId } = require('./common');
const { LEAD_STATUSES } = require('../models/Lead');

const create = {
  body: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    email: Joi.string().email().allow('', null),
    phone: Joi.string().allow('', null),
    company: Joi.string().allow('', null),
    source: Joi.string().valid('website', 'referral', 'ads', 'social', 'event', 'other'),
    status: Joi.string().valid(...LEAD_STATUSES),
    estimatedValue: Joi.number().min(0),
    probability: Joi.number().min(0).max(100),
    expectedCloseDate: Joi.date(),
    notes: Joi.string().allow('', null),
    assignedTo: objectId,
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    name: Joi.string().min(2).max(120),
    email: Joi.string().email().allow('', null),
    phone: Joi.string().allow('', null),
    company: Joi.string().allow('', null),
    source: Joi.string().valid('website', 'referral', 'ads', 'social', 'event', 'other'),
    status: Joi.string().valid(...LEAD_STATUSES),
    estimatedValue: Joi.number().min(0),
    probability: Joi.number().min(0).max(100),
    expectedCloseDate: Joi.date(),
    notes: Joi.string().allow('', null),
    assignedTo: objectId.allow(null),
  }).min(1),
};

const getById = { params: Joi.object({ id: objectId.required() }) };

const list = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    status: Joi.string().valid(...LEAD_STATUSES),
    source: Joi.string(),
    assignedTo: objectId,
    search: Joi.string().allow(''),
  }),
};

const convert = { params: Joi.object({ id: objectId.required() }) };

module.exports = { create, update, getById, list, convert };
