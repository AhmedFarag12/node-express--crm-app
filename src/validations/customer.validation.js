const Joi = require('joi');
const { objectId } = require('./common');

const addressSchema = Joi.object({
  street: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  zip: Joi.string().allow('', null),
});

const create = {
  body: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    email: Joi.string().email().allow('', null),
    phone: Joi.string().allow('', null),
    company: Joi.string().allow('', null),
    address: addressSchema,
    tags: Joi.array().items(Joi.string()),
    notes: Joi.string().allow('', null),
    status: Joi.string().valid('active', 'inactive', 'prospect'),
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
    address: addressSchema,
    tags: Joi.array().items(Joi.string()),
    notes: Joi.string().allow('', null),
    status: Joi.string().valid('active', 'inactive', 'prospect'),
    assignedTo: objectId.allow(null),
  }).min(1),
};

const getById = { params: Joi.object({ id: objectId.required() }) };

const list = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    status: Joi.string().valid('active', 'inactive', 'prospect'),
    assignedTo: objectId,
    search: Joi.string().allow(''),
  }),
};

const recordPurchase = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    amount: Joi.number().positive().required(),
    purchasedAt: Joi.date(),
  }),
};

module.exports = { create, update, getById, list, recordPurchase };
