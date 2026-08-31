import { db, faxInbox } from "@cliniq/db";
import { eq, desc, sql } from "drizzle-orm";
import type {
  CreateFaxInput,
  PaginatedResponse,
} from "@cliniq/api-spec";
import { classifyFaxDocument } from "../lib/ai";
import { formatPaginatedResponse } from "../lib/pagination";

export interface PaginationOffsetParams {
  page: number;
  pageSize: number;
  offset: number;
}

export async function listFaxInbox(
  organizationId: string,
  pagination: PaginationOffsetParams
): Promise<{ faxes: (typeof faxInbox.$inferSelect)[] } & PaginatedResponse<typeof faxInbox.$inferSelect>> {
  const { page, pageSize, offset } = pagination;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(faxInbox)
    .where(eq(faxInbox.organizationId, organizationId));

  const totalItems = Number(totalCountResult?.count) || 0;

  const faxes = await db
    .select()
    .from(faxInbox)
    .where(eq(faxInbox.organizationId, organizationId))
    .orderBy(desc(faxInbox.receivedAt))
    .limit(pageSize)
    .offset(offset);

  return {
    faxes,
    ...formatPaginatedResponse(faxes, totalItems, page, pageSize),
  };
}

export async function ingestFax(
  organizationId: string,
  input: CreateFaxInput
): Promise<typeof faxInbox.$inferSelect | null> {
  const { senderNumber, fileName } = input;

  // In production, OCR text is extracted from documentBase64 via cloud vision or Tesseract
  const dummyOcrText = `Clinical Discharge Summary from Memorial Hospital for patient. Inbound fax from ${senderNumber || "unknown"}. File: ${fileName || "document.pdf"}`;
  const aiClassification = await classifyFaxDocument(dummyOcrText);

  const [newFax] = await db
    .insert(faxInbox)
    .values({
      organizationId,
      senderNumber: senderNumber || "(555) 019-2834",
      classification: aiClassification.classification,
      extractedEntities: aiClassification.extractedEntities,
      status: "pending_review",
    })
    .returning();

  return newFax || null;
}
