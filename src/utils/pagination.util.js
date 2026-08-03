/**
 * Pagination helper utility for standardized database queries & responses
 */

export function getPaginationParams(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function formatPaginatedResponse({ data, totalItems, page, limit, extra = {} }) {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = page;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    ...extra,
    data,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      pageSize: limit,
      hasNextPage,
      hasPrevPage,
    },
  };
}

export default {
  getPaginationParams,
  formatPaginatedResponse,
};
