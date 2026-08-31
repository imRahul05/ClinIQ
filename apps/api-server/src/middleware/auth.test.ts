import { describe, it, expect } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  authMiddleware,
  signUserToken,
  requireRole,
  requireAdmin,
  orgId,
  mapRoleFromProfile,
  extractEmail,
  extractUserId,
  extractPatientId,
  extractProviderId,
  extractOrganizationId,
  mapMedplumProfileToUserClaims,
} from "./auth";
import type { UserClaims } from "@cliniq/api-spec";
import type { Patient, Practitioner, ProjectMembership } from "@cliniq/fhir-core";

interface MockResponseState {
  statusCode: number;
  body: Record<string, string | number | boolean>;
}

interface MockResponseObject {
  status: (code: number) => MockResponseObject;
  json: (data: Record<string, string | number | boolean>) => MockResponseObject;
}

function createMockResponse(): { res: Response; state: MockResponseState } {
  const state: MockResponseState = {
    statusCode: 200,
    body: {},
  };

  const resObj: MockResponseObject = {
    status(code: number): MockResponseObject {
      state.statusCode = code;
      return resObj;
    },
    json(data: Record<string, string | number | boolean>): MockResponseObject {
      state.body = data;
      return resObj;
    },
  };

  const res = resObj as never as Response;

  return { res, state };
}

describe("Auth Middleware & Medplum JWT Verification Suite", () => {
  const sampleUserClaims: UserClaims = {
    userId: "usr-12345",
    email: "doctor@cliniq.local",
    role: "physician",
    organizationId: "org-apex-01",
    providerId: "prov-99",
    isAdmin: false,
  };

  describe("signUserToken & HS256 Token Flow", () => {
    it("should generate a valid verifiable internal JWT", async () => {
      const token = signUserToken(sampleUserClaims);
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      const { res } = createMockResponse();
      let nextCalled = false;
      const next: NextFunction = () => {
        nextCalled = true;
      };

      await authMiddleware(req, res, next);
      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe("usr-12345");
      expect(req.user?.email).toBe("doctor@cliniq.local");
      expect(req.user?.role).toBe("physician");
      expect(req.user?.organizationId).toBe("org-apex-01");
    });

    it("should reject requests without authorization header", async () => {
      const req = { headers: {} } as Request;
      const { res, state } = createMockResponse();
      let nextCalled = false;

      await authMiddleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(state.statusCode).toBe(401);
      expect(state.body.error).toContain("Missing or invalid authorization header");
    });

    it("should reject malformed or non-Bearer authorization headers", async () => {
      const req = {
        headers: {
          authorization: "Basic dXNlcjpwYXNz",
        },
      } as Request;
      const { res, state } = createMockResponse();
      let nextCalled = false;

      await authMiddleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(state.statusCode).toBe(401);
    });

    it("should reject invalid or expired tokens", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalid.token.payload",
        },
      } as Request;
      const { res, state } = createMockResponse();
      let nextCalled = false;

      await authMiddleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(state.statusCode).toBe(401);
      expect(state.body.error).toContain("Invalid or expired token");
    });
  });

  describe("Role Mapping Decisions & FHIR Normalization", () => {
    it("should map ProjectMembership with admin: true to admin role", () => {
      const membership: ProjectMembership = {
        resourceType: "ProjectMembership",
        id: "pm-100",
        project: { reference: "Project/proj-001" },
        user: { reference: "User/u-001" },
        profile: { reference: "Practitioner/prac-001" },
        admin: true,
      };

      const result = mapRoleFromProfile(null, membership);
      expect(result.role).toBe("admin");
      expect(result.isAdmin).toBe(true);
    });

    it("should map Practitioner with nursing credentials to nurse role", () => {
      const nurseProfile: Practitioner = {
        resourceType: "Practitioner",
        id: "prac-nurse-1",
        name: [{ family: "Rostova", given: ["Elena"] }],
        qualification: [
          {
            code: {
              text: "Registered Nurse (RN), BSN",
              coding: [{ code: "RN", display: "Registered Nurse" }],
            },
          },
        ],
      };

      const result = mapRoleFromProfile(nurseProfile, null);
      expect(result.role).toBe("nurse");
      expect(result.isAdmin).toBe(false);
    });

    it("should map Practitioner with care coordinator specialty to care_coordinator role", () => {
      const coordProfile: Practitioner = {
        resourceType: "Practitioner",
        id: "prac-coord-1",
        identifier: [{ value: "care_coordinator_licensed" }],
      };

      const result = mapRoleFromProfile(coordProfile, null);
      expect(result.role).toBe("care_coordinator");
      expect(result.isAdmin).toBe(false);
    });

    it("should default Practitioner without nursing tags to physician role", () => {
      const physicianProfile: Practitioner = {
        resourceType: "Practitioner",
        id: "prac-md-1",
        name: [{ family: "Vance", given: ["Arthur"] }],
        qualification: [
          {
            code: {
              text: "Doctor of Medicine (MD)",
              coding: [{ code: "MD", display: "Physician" }],
            },
          },
        ],
      };

      const result = mapRoleFromProfile(physicianProfile, null);
      expect(result.role).toBe("physician");
      expect(result.isAdmin).toBe(false);
    });

    it("should map FHIR Patient resource to patient role", () => {
      const patientProfile: Patient = {
        resourceType: "Patient",
        id: "pat-100",
        name: [{ family: "Johnson", given: ["Sarah"] }],
      };

      const result = mapRoleFromProfile(patientProfile, null);
      expect(result.role).toBe("patient");
      expect(result.isAdmin).toBe(false);
    });
  });

  describe("Claim Extraction Helpers", () => {
    it("should extract email from profile telecom or membership", () => {
      const patient: Patient = {
        resourceType: "Patient",
        telecom: [{ system: "email", value: "sarah@apexhealth.demo" }],
      };
      expect(extractEmail(patient, null)).toBe("sarah@apexhealth.demo");

      const membership: ProjectMembership = {
        resourceType: "ProjectMembership",
        project: { reference: "Project/p1" },
        user: { reference: "User/u1" },
        profile: { reference: "Patient/p1" },
        userName: "member@example.com",
      };
      expect(extractEmail(null, membership)).toBe("member@example.com");
    });

    it("should extract IDs cleanly from FHIR references and resources", () => {
      const practitioner: Practitioner = {
        resourceType: "Practitioner",
        id: "prac-555",
      };
      expect(extractUserId(practitioner, null)).toBe("prac-555");
      expect(extractProviderId(practitioner, null)).toBe("prac-555");
      expect(extractPatientId(practitioner, null)).toBeUndefined();

      const patient: Patient = {
        resourceType: "Patient",
        id: "pat-777",
      };
      expect(extractPatientId(patient, null)).toBe("pat-777");
      expect(extractProviderId(patient, null)).toBeUndefined();
    });

    it("should extract organization ID from project references or metadata", () => {
      const membership: ProjectMembership = {
        resourceType: "ProjectMembership",
        project: { reference: "Project/proj-target-uuid" },
        user: { reference: "User/u1" },
        profile: { reference: "Patient/p1" },
      };
      expect(extractOrganizationId(null, membership)).toBe("proj-target-uuid");
    });

    it("should map complete profile and membership into unified UserClaims", () => {
      const practitioner: Practitioner = {
        resourceType: "Practitioner",
        id: "prac-888",
        telecom: [{ system: "email", value: "dr.vance@cliniq.demo" }],
      };
      const membership: ProjectMembership = {
        resourceType: "ProjectMembership",
        project: { reference: "Project/org-hospital-1" },
        user: { reference: "User/user-vance" },
        profile: { reference: "Practitioner/prac-888" },
        admin: false,
      };

      const claims = mapMedplumProfileToUserClaims({
        profile: practitioner,
        membership,
      });

      expect(claims.userId).toBe("user-vance");
      expect(claims.email).toBe("dr.vance@cliniq.demo");
      expect(claims.role).toBe("physician");
      expect(claims.organizationId).toBe("org-hospital-1");
      expect(claims.providerId).toBe("prac-888");
      expect(claims.patientId).toBeUndefined();
      expect(claims.isAdmin).toBe(false);
    });
  });

  describe("Access Control Guards (requireRole, requireAdmin, orgId)", () => {
    it("requireRole should allow authorized roles and reject unauthorized roles", () => {
      const guard = requireRole("physician", "nurse");

      // Authorized request
      const authReq = {
        user: { ...sampleUserClaims, role: "physician" },
      } as Request;
      const { res: authRes } = createMockResponse();
      let nextCalled = false;
      guard(authReq, authRes, () => {
        nextCalled = true;
      });
      expect(nextCalled).toBe(true);

      // Unauthorized request
      const unauthReq = {
        user: { ...sampleUserClaims, role: "patient" },
      } as Request;
      const { res: unauthRes, state: unauthResState } = createMockResponse();
      let unauthNextCalled = false;
      guard(unauthReq, unauthRes, () => {
        unauthNextCalled = true;
      });
      expect(unauthNextCalled).toBe(false);
      expect(unauthResState.statusCode).toBe(403);
    });

    it("requireRole should grant bypass access to admin users", () => {
      const guard = requireRole("nurse");
      const adminReq = {
        user: { ...sampleUserClaims, role: "patient", isAdmin: true },
      } as Request;
      const { res } = createMockResponse();
      let nextCalled = false;

      guard(adminReq, res, () => {
        nextCalled = true;
      });
      expect(nextCalled).toBe(true);
    });

    it("requireAdmin should enforce admin privileges", () => {
      const nonAdminReq = {
        user: { ...sampleUserClaims, role: "physician", isAdmin: false },
      } as Request;
      const { res: nonAdminRes, state: nonAdminState } = createMockResponse();
      let nonAdminNext = false;

      requireAdmin(nonAdminReq, nonAdminRes, () => {
        nonAdminNext = true;
      });
      expect(nonAdminNext).toBe(false);
      expect(nonAdminState.statusCode).toBe(403);

      const adminReq = {
        user: { ...sampleUserClaims, role: "admin", isAdmin: true },
      } as Request;
      const { res: adminRes } = createMockResponse();
      let adminNext = false;

      requireAdmin(adminReq, adminRes, () => {
        adminNext = true;
      });
      expect(adminNext).toBe(true);
    });

    it("orgId should extract valid organization ID or throw on missing context", () => {
      const validReq = {
        user: sampleUserClaims,
      } as Request;
      expect(orgId(validReq)).toBe("org-apex-01");

      const invalidReq = {
        user: undefined,
      } as Request;
      expect(() => orgId(invalidReq)).toThrowError(/Organization ID not found/);
    });
  });
});
