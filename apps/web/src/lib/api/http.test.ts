import { describe, it, expect, vi, beforeEach } from "vitest";
import axios, { type AxiosResponse, type InternalAxiosRequestConfig, type AxiosError } from "axios";
import { http, ApiError, apiClient, normalizeAxiosError, type ServerErrorPayload } from "./http";
import { medplum } from "../medplum";

describe("HTTP Client with Axios & Medplum Interceptors", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create standardized ApiError instances with status codes and payloads", () => {
    const error = new ApiError({
      error: "Unauthorized",
      message: "Session token expired",
      statusCode: 401,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe("ApiError");
    expect(error.message).toBe("Session token expired");
    expect(error.statusCode).toBe(401);
    expect(error.errorPayload.error).toBe("Unauthorized");
  });

  it("should provide convenience methods for get, post, put, patch, and delete", () => {
    expect(typeof http.get).toBe("function");
    expect(typeof http.post).toBe("function");
    expect(typeof http.put).toBe("function");
    expect(typeof http.patch).toBe("function");
    expect(typeof http.delete).toBe("function");
  });

  it("should attach Medplum Bearer token via request interceptor if available", async () => {
    vi.spyOn(medplum, "getAccessToken").mockReturnValue("test-medplum-jwt-token");
    const mockResponse: AxiosResponse<{ success: boolean }> = {
      data: { success: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new axios.AxiosHeaders(),
      } as InternalAxiosRequestConfig,
    };
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockResponse);

    // Test calling http.get invokes apiClient.get
    const result = await http.get<{ success: boolean }>("/test-endpoint");
    expect(result).toEqual({ success: true });
    expect(getSpy).toHaveBeenCalledWith("/test-endpoint", expect.objectContaining({}));
  });

  it("should support post, put, patch, and delete methods", async () => {
    const mockData = { id: "123" };
    const mockResponse: AxiosResponse<typeof mockData> = {
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: new axios.AxiosHeaders() } as InternalAxiosRequestConfig,
    };

    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockResponse);
    const putSpy = vi.spyOn(apiClient, "put").mockResolvedValueOnce(mockResponse);
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce(mockResponse);
    const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce(mockResponse);

    expect(await http.post("/api/items", { name: "item" })).toEqual(mockData);
    expect(postSpy).toHaveBeenCalledWith("/api/items", { name: "item" }, undefined);

    expect(await http.put("/api/items/123", { name: "updated" })).toEqual(mockData);
    expect(putSpy).toHaveBeenCalledWith("/api/items/123", { name: "updated" }, undefined);

    expect(await http.patch("/api/items/123", { name: "patched" })).toEqual(mockData);
    expect(patchSpy).toHaveBeenCalledWith("/api/items/123", { name: "patched" }, undefined);

    expect(await http.delete("/api/items/123")).toEqual(mockData);
    expect(deleteSpy).toHaveBeenCalledWith("/api/items/123", undefined);
  });

  it("should normalize axios errors correctly into ApiError", () => {
    // HTTP 400 with structured object
    const structuredHttpError = {
      name: "AxiosError",
      message: "Request failed with status code 400",
      response: {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new axios.AxiosHeaders() } as InternalAxiosRequestConfig,
        data: { error: "ValidationError", message: "Invalid payload" },
      },
    } as AxiosError<{ error: string; message: string }>;

    const err1 = normalizeAxiosError(structuredHttpError);
    expect(err1.statusCode).toBe(400);
    expect(err1.errorPayload.error).toBe("ValidationError");
    expect(err1.message).toBe("Invalid payload");

    // HTTP 500 with string data
    const stringHttpError = {
      name: "AxiosError",
      message: "Request failed with status code 500",
      response: {
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config: { headers: new axios.AxiosHeaders() } as InternalAxiosRequestConfig,
        data: "Internal Server Failure",
      },
    } as AxiosError<string>;

    const err2 = normalizeAxiosError(stringHttpError);
    expect(err2.statusCode).toBe(500);
    expect(err2.errorPayload.error).toBe("Internal Server Failure");

    // Network error (no response)
    const networkError = {
      name: "AxiosError",
      isAxiosError: true,
      request: {},
      message: "Connection refused",
    } as AxiosError<ServerErrorPayload | string>;

    const err3 = normalizeAxiosError(networkError);
    expect(err3.statusCode).toBe(503);
    expect(err3.errorPayload.error).toBe("NetworkError");

    // Unexpected error
    const genericError = {
      name: "SetupError",
      message: "Something went wrong",
    } as AxiosError<ServerErrorPayload | string>;

    const err4 = normalizeAxiosError(genericError);
    expect(err4.statusCode).toBe(500);
    expect(err4.errorPayload.error).toBe("SetupError");
  });
});
