const Joi = require('joi');
const { objectId } = require('./common');

const create = {
  body: Joi.object({
    name: Joi.string().min(2).max(80).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    phone: Joi.string().allow('', null),
    role: Joi.string().valid('admin', 'sales', 'user').default('user'),
    isActive: Joi.boolean(),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    name: Joi.string().min(2).max(80),
    email: Joi.string().email(),
    phone: Joi.string().allow('', null),
    role: Joi.string().valid('admin', 'sales', 'user'),
    isActive: Joi.boolean(),
  }).min(1),
};

const getById = { params: Joi.object({ id: objectId.required() }) };

const list = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    role: Joi.string().valid('admin', 'sales', 'user'),
    search: Joi.string().allow(''),
    isActive: Joi.boolean(),
  }),
};

module.exports = { create, update, getById, list };
