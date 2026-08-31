import type { PaginationMeta, PaginationQuery, PaginatedResponse } from "@cliniq/api-spec";

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export function parsePaginationParams(query: Record<string, unknown>): {
  page: number;
  pageSize: number;
  offset: number;
} {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

export function buildPaginationMeta(
  totalItems: number,
  page: number,
  pageSize: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / pageSize) || (totalItems === 0 ? 0 : 1);
  const hasNextPage = page < totalPages;
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
  };
}

export function formatPaginatedResponse<T>(
  items: T[],
  totalItems: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    data: items,
    pagination: buildPaginationMeta(totalItems, page, pageSize),
  };
}
