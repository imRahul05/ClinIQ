import { db, users, providers, employers } from "@cliniq/db";
import { eq, sql } from "drizzle-orm";
import type { PaginatedResponse } from "@cliniq/api-spec";
import { formatPaginatedResponse } from "../lib/pagination";

export interface PaginationOffsetParams {
  page: number;
  pageSize: number;
  offset: number;
}

export async function getAdminUsers(
  organizationId: string,
  pagination: PaginationOffsetParams
): Promise<{ users: (typeof users.$inferSelect)[] } & PaginatedResponse<typeof users.$inferSelect>> {
  const { page, pageSize, offset } = pagination;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.organizationId, organizationId));

  const totalItems = Number(totalCountResult?.count) || 0;

  const staff = await db
    .select()
    .from(users)
    .where(eq(users.organizationId, organizationId))
    .limit(pageSize)
    .offset(offset);

  return {
    users: staff,
    ...formatPaginatedResponse(staff, totalItems, page, pageSize),
  };
}

export async function getAdminProviders(
  organizationId: string,
  pagination: PaginationOffsetParams
): Promise<{ providers: (typeof providers.$inferSelect)[] } & PaginatedResponse<typeof providers.$inferSelect>> {
  const { page, pageSize, offset } = pagination;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(providers)
    .where(eq(providers.organizationId, organizationId));

  const totalItems = Number(totalCountResult?.count) || 0;

  const providerList = await db
    .select()
    .from(providers)
    .where(eq(providers.organizationId, organizationId))
    .limit(pageSize)
    .offset(offset);

  return {
    providers: providerList,
    ...formatPaginatedResponse(providerList, totalItems, page, pageSize),
  };
}

export async function getAdminEmployers(
  organizationId: string,
  pagination: PaginationOffsetParams
): Promise<{ employers: (typeof employers.$inferSelect)[] } & PaginatedResponse<typeof employers.$inferSelect>> {
  const { page, pageSize, offset } = pagination;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(employers)
    .where(eq(employers.organizationId, organizationId));

  const totalItems = Number(totalCountResult?.count) || 0;

  const employerList = await db
    .select()
    .from(employers)
    .where(eq(employers.organizationId, organizationId))
    .limit(pageSize)
    .offset(offset);

  return {
    employers: employerList,
    ...formatPaginatedResponse(employerList, totalItems, page, pageSize),
  };
}
