import { describe, it, expect } from "vitest";
import { validateDbConfig } from "./config";

describe("Database Configuration Validation", () => {
  it("should successfully parse a valid postgresql connection string", () => {
    const config = validateDbConfig({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5433/cliniq",
    });

    expect(config.databaseUrl).toBe("postgresql://postgres:postgres@localhost:5433/cliniq");
  });

  it("should fail fast with actionable message if DATABASE_URL is missing", () => {
    expect(() => validateDbConfig({})).toThrowError(/DATABASE_URL is required/);
  });

  it("should fail fast if DATABASE_URL does not start with postgres:// or postgresql://", () => {
    expect(() =>
      validateDbConfig({
        DATABASE_URL: "mysql://root:root@localhost:3306/cliniq",
      })
    ).toThrowError(/must start with 'postgresql:\/\/' or 'postgres:\/\/'/);
  });
});
