import { describe, it, expect, vi } from "vitest";
import {
  CreateCallSessionSchema,
  UpdateCallSessionSchema,
  UpdateCareGapSchema,
  CreateFaxSchema,
  CreateSoapNoteSchema,
  WebSocketAuthMessageSchema,
  PaginationQuerySchema,
  APIErrorEnvelopeSchema,
} from "@cliniq/api-spec";
import {
  parsePaginationParams,
  buildPaginationMeta,
  formatPaginatedResponse,
} from "../lib/pagination";
import { sendErrorResponse, sendValidationError } from "../middleware/errorHandler";
import type { Response } from "express";

interface MockResponseState {
  statusCode: number;
  body: Record<string, unknown>;
}

function createMockResponse(): { res: Response; state: MockResponseState } {
  const state: MockResponseState = {
    statusCode: 200,
    body: {},
  };

  const resObj = {
    status(code: number) {
      state.statusCode = code;
      return resObj;
    },
    json(data: Record<string, unknown>) {
      state.body = data;
      return resObj;
    },
  };

  return { res: resObj as unknown as Response, state };
}

describe("REST API Modernization & Pagination Suite", () => {
  describe("Pagination Utility Helper", () => {
    it("should parse default pagination parameters safely", () => {
      const parsed = parsePaginationParams({});
      expect(parsed.page).toBe(1);
      expect(parsed.pageSize).toBe(20);
      expect(parsed.offset).toBe(0);
    });

    it("should calculate correct offset for page 3 with pageSize 15", () => {
      const parsed = parsePaginationParams({ page: "3", pageSize: "15" });
      expect(parsed.page).toBe(3);
      expect(parsed.pageSize).toBe(15);
      expect(parsed.offset).toBe(30);
    });

    it("should build accurate pagination metadata and hasNextPage boolean", () => {
      const meta = buildPaginationMeta(45, 2, 20);
      expect(meta.totalItems).toBe(45);
      expect(meta.totalPages).toBe(3);
      expect(meta.hasNextPage).toBe(true);

      const lastPageMeta = buildPaginationMeta(45, 3, 20);
      expect(lastPageMeta.hasNextPage).toBe(false);

      const emptyMeta = buildPaginationMeta(0, 1, 20);
      expect(emptyMeta.totalItems).toBe(0);
      expect(emptyMeta.totalPages).toBe(0);
      expect(emptyMeta.hasNextPage).toBe(false);
    });

    it("should format standardized paginated response envelope", () => {
      const items = [{ id: "1" }, { id: "2" }];
      const response = formatPaginatedResponse(items, 50, 1, 2);
      expect(response.data).toEqual(items);
      expect(response.pagination.totalItems).toBe(50);
      expect(response.pagination.totalPages).toBe(25);
      expect(response.pagination.hasNextPage).toBe(true);
    });
  });

  describe("Standardized Error Envelope Middleware", () => {
    it("should output standard { error: { code, message } } format", () => {
      const { res, state } = createMockResponse();
      sendErrorResponse(res, 404, "RESOURCE_NOT_FOUND", "Care gap not found");

      expect(state.statusCode).toBe(404);
      expect(state.body).toEqual({
        error: {
          code: "RESOURCE_NOT_FOUND",
          message: "Care gap not found",
        },
      });

      const validated = APIErrorEnvelopeSchema.safeParse(state.body);
      expect(validated.success).toBe(true);
    });

    it("should map Zod validation errors to HTTP 422 with structured details", () => {
      const { res, state } = createMockResponse();
      const parse = CreateCallSessionSchema.safeParse({ callType: "invalid_type" });
      expect(parse.success).toBe(false);

      if (!parse.success) {
        sendValidationError(res, parse.error);
        expect(state.statusCode).toBe(422);
        expect(state.body.error).toBeDefined();
        const errorObj = state.body.error as { code: string; message: string; details?: unknown };
        expect(errorObj.code).toBe("VALIDATION_ERROR");
        expect(errorObj.details).toBeDefined();
      }
    });
  });

  describe("REST Domain Schemas Validation", () => {
    it("should validate CreateCallSessionSchema for POST /api/calls", () => {
      const valid = CreateCallSessionSchema.safeParse({
        patientId: "a0000000-0000-0000-0000-000000000001",
        callType: "video",
        urgency: "high",
        reason: "Acute hypertension check",
      });
      expect(valid.success).toBe(true);
    });

    it("should validate UpdateCallSessionSchema for PATCH /api/calls/:id", () => {
      const valid = UpdateCallSessionSchema.safeParse({
        status: "completed",
        durationSeconds: 340,
        transcriptText: "Patient reported normal blood pressure readings.",
      });
      expect(valid.success).toBe(true);
    });

    it("should validate UpdateCareGapSchema for PATCH /api/care-gaps/:id", () => {
      const valid = UpdateCareGapSchema.safeParse({
        status: "closed",
        evidence: "Patient completed annual HbA1c screening with result 6.8%",
      });
      expect(valid.success).toBe(true);
    });

    it("should validate CreateFaxSchema for POST /api/fax", () => {
      const valid = CreateFaxSchema.safeParse({
        senderNumber: "(555) 019-2834",
        documentBase64: "JVBERi0xLjQKJcTl8uXr...",
        fileName: "discharge_summary.pdf",
      });
      expect(valid.success).toBe(true);
    });

    it("should validate CreateSoapNoteSchema for POST /api/scribe/notes", () => {
      const valid = CreateSoapNoteSchema.safeParse({
        transcript: "Doctor: How is the knee feeling? Patient: Much better after physical therapy.",
        patientContext: {
          age: 45,
          gender: "Male",
          activeConditions: ["Osteoarthritis"],
        },
      });
      expect(valid.success).toBe(true);
    });

    it("should validate WebSocketAuthMessageSchema for cryptographically secure /ws handshake", () => {
      const valid = WebSocketAuthMessageSchema.safeParse({
        type: "auth",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      });
      expect(valid.success).toBe(true);

      const invalid = WebSocketAuthMessageSchema.safeParse({
        type: "auth",
        userId: "unverified-user",
      });
      expect(invalid.success).toBe(false);
    });

    it("should coerce PaginationQuerySchema parameters", () => {
      const valid = PaginationQuerySchema.parse({
        page: "2",
        pageSize: "50",
        sortOrder: "asc",
      });
      expect(valid.page).toBe(2);
      expect(valid.pageSize).toBe(50);
      expect(valid.sortOrder).toBe("asc");
    });
  });
});
