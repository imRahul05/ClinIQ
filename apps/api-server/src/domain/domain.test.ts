import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateAuthorizedPatientAccess } from "./patient.domain";
import type { UserClaims } from "@cliniq/api-spec";

describe("Domain Layer Unit Tests", () => {
  describe("Patient Domain Authorization", () => {
    it("should allow a patient user to access their own records", () => {
      const user: UserClaims = {
        userId: "u1",
        email: "patient@cliniq.local",
        role: "patient",
        organizationId: "org-1",
        patientId: "p1",
      };

      const result = validateAuthorizedPatientAccess(user, "p1");
      expect(result.authorizedPatientId).toBe("p1");
      expect(result.error).toBeUndefined();
    });

    it("should default to the authenticated patient's own ID if requestedPatientId is not passed", () => {
      const user: UserClaims = {
        userId: "u1",
        email: "patient@cliniq.local",
        role: "patient",
        organizationId: "org-1",
        patientId: "p1",
      };

      const result = validateAuthorizedPatientAccess(user);
      expect(result.authorizedPatientId).toBe("p1");
      expect(result.error).toBeUndefined();
    });

    it("should deny a patient user attempting to access another patient's records", () => {
      const user: UserClaims = {
        userId: "u1",
        email: "patient1@cliniq.local",
        role: "patient",
        organizationId: "org-1",
        patientId: "p1",
      };

      const result = validateAuthorizedPatientAccess(user, "p2");
      expect(result.authorizedPatientId).toBeUndefined();
      expect(result.error?.status).toBe(403);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("should allow a clinical provider (nurse/physician) to access any patient's records", () => {
      const nurseUser: UserClaims = {
        userId: "u2",
        email: "nurse@cliniq.local",
        role: "nurse",
        organizationId: "org-1",
        providerId: "prov-1",
      };

      const result = validateAuthorizedPatientAccess(nurseUser, "p2");
      expect(result.authorizedPatientId).toBe("p2");
      expect(result.error).toBeUndefined();
    });

    it("should allow an admin to access any patient's records", () => {
      const adminUser: UserClaims = {
        userId: "u3",
        email: "admin@cliniq.local",
        role: "admin",
        organizationId: "org-1",
        isAdmin: true,
      };

      const result = validateAuthorizedPatientAccess(adminUser, "p99");
      expect(result.authorizedPatientId).toBe("p99");
      expect(result.error).toBeUndefined();
    });

    it("should return 400 BAD_REQUEST if no patient ID is available", () => {
      const user: UserClaims = {
        userId: "u4",
        email: "staff@cliniq.local",
        role: "care_coordinator",
        organizationId: "org-1",
      };

      const result = validateAuthorizedPatientAccess(user);
      expect(result.error?.status).toBe(400);
      expect(result.error?.code).toBe("BAD_REQUEST");
    });
  });
});
