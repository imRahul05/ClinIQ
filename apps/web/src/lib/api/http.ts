import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { PaginatedResponse, PaginationMeta } from "@cliniq/api-spec";
import { clientConfig } from "../../config";
import { medplum } from "../medplum";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | { [key: string]: JsonValue } | JsonValue[];
export type HttpBody = Record<string, JsonValue | undefined> | JsonValue | object;

export interface RequestOptions {
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, string | number | boolean | undefined | null> | object;
  readonly timeout?: number;
}

export interface ApiErrorResponse {
  readonly error: string;
  readonly code?: string;
  readonly message?: string;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly errorPayload: ApiErrorResponse;

  constructor(payload: ApiErrorResponse) {
    super(payload.message || payload.error || "An API error occurred");
    this.name = "ApiError";
    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.errorPayload = payload;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface ServerStructuredError {
  readonly code?: string;
  readonly message?: string;
  readonly details?: Record<string, unknown>;
}

export interface ServerErrorPayload {
  readonly error?: string | ServerStructuredError;
  readonly message?: string;
  readonly statusCode?: number;
  readonly details?: Record<string, JsonValue | undefined>;
}

const API_BASE_URL: string = clientConfig.apiUrl;

/**
 * Centralized Axios instance configured for ClinIQ operational services.
 * Enforces zero usage of raw fetch() calls across the application.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Helper to retrieve the active Bearer token:
 * First checks Medplum OAuth2/OIDC session, then falls back to localStorage.
 */
function getActiveAuthToken(): string | null {
  return (
    medplum.getAccessToken() ||
    (typeof window !== "undefined" ? localStorage.getItem("cliniq_token") : null)
  );
}

/**
 * Normalizes Axios error states (HTTP 4xx/5xx, network offline, setup failure)
 * into a strongly-typed `ApiError`.
 */
export function normalizeAxiosError(error: AxiosError<ServerErrorPayload | string>): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    const isString = typeof data === "string";
    const errorData = typeof data === "object" && data !== null ? data : undefined;

    let errorName = "HTTP Error";
    let errorMessage = `Request failed with status ${status}`;
    let errorCode: string | undefined;
    let errorDetails: Record<string, unknown> | undefined;

    if (isString) {
      errorName = data;
      errorMessage = data;
    } else if (errorData) {
      if (typeof errorData.error === "object" && errorData.error !== null) {
        const structured = errorData.error as ServerStructuredError;
        errorCode = structured.code;
        errorName = structured.code || "API_ERROR";
        errorMessage = structured.message || errorData.message || errorMessage;
        errorDetails = structured.details;
      } else if (typeof errorData.error === "string") {
        errorName = errorData.error;
        errorMessage = errorData.message || errorData.error;
      }
    }

    return new ApiError({
      error: errorName,
      code: errorCode,
      message: errorMessage,
      statusCode: status,
      details: errorDetails,
    });
  }

  if (error.request) {
    return new ApiError({
      error: "NetworkError",
      code: "NETWORK_ERROR",
      message:
        error.message ||
        "ClinIQ API server unreachable. Verify backend server is running on port 4000.",
      statusCode: 503,
    });
  }

  return new ApiError({
    error: error.name || "ApiError",
    code: "UNEXPECTED_ERROR",
    message: error.message || "An unexpected error occurred during HTTP transaction",
    statusCode: 500,
  });
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getActiveAuthToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError): Promise<never> =>
    Promise.reject(
      new ApiError({
        error: error.name || "RequestConfigurationError",
        message: error.message || "Failed to configure outgoing HTTP request",
        statusCode: 400,
      })
    )
);

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError<ServerErrorPayload | string>): Promise<never> =>
    Promise.reject(normalizeAxiosError(error))
);

async function unwrap<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
  const response = await promise;
  return response.data;
}

export interface HttpService {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  post<T = void, B = HttpBody>(endpoint: string, data?: B, options?: RequestOptions): Promise<T>;
  put<T = void, B = HttpBody>(endpoint: string, data?: B, options?: RequestOptions): Promise<T>;
  patch<T = void, B = HttpBody>(endpoint: string, data?: B, options?: RequestOptions): Promise<T>;
  delete<T = void>(endpoint: string, options?: RequestOptions): Promise<T>;
}

/**
 * Strongly-typed HTTP convenience methods for ClinIQ operational API modules.
 */
export const http: HttpService = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    unwrap(apiClient.get<T>(endpoint, options)),
  post: <T = void, B = HttpBody>(endpoint: string, data?: B, options?: RequestOptions) =>
    unwrap(apiClient.post<T>(endpoint, data, options)),
  put: <T = void, B = HttpBody>(endpoint: string, data?: B, options?: RequestOptions) =>
    unwrap(apiClient.put<T>(endpoint, data, options)),
  patch: <T = void, B = HttpBody>(endpoint: string, data?: B, options?: RequestOptions) =>
    unwrap(apiClient.patch<T>(endpoint, data, options)),
  delete: <T = void>(endpoint: string, options?: RequestOptions) =>
    unwrap(apiClient.delete<T>(endpoint, options)),
};
