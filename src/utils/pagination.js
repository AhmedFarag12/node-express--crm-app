const buildPagination = (query = {}, defaults = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || defaults.page || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit, 10) || defaults.limit || 20)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const paginatedResponse = (items, total, { page, limit }) => ({
  items,
  pagination: {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

module.exports = { buildPagination, paginatedResponse };
