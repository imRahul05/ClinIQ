import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { clientConfig } from "../../config";
import { medplum } from "../medplum";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | { [key: string]: JsonValue } | JsonValue[];
export type HttpBody = Record<string, JsonValue | undefined> | JsonValue | object;

export interface RequestOptions {
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, string | number | boolean | undefined>;
  readonly timeout?: number;
}

export interface ApiErrorResponse {
  readonly error: string;
  readonly message?: string;
  readonly statusCode: number;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorPayload: ApiErrorResponse;

  constructor(payload: ApiErrorResponse) {
    super(payload.message || payload.error || "An API error occurred");
    this.name = "ApiError";
    this.statusCode = payload.statusCode;
    this.errorPayload = payload;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface ServerErrorPayload {
  readonly error?: string;
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

    return new ApiError({
      error: isString ? data : errorData?.error || "HTTP Error",
      message: isString ? data : errorData?.message || `Request failed with status ${status}`,
      statusCode: status,
    });
  }

  if (error.request) {
    return new ApiError({
      error: "NetworkError",
      message:
        error.message ||
        "ClinIQ API server unreachable. Verify backend server is running on port 4000.",
      statusCode: 503,
    });
  }

  return new ApiError({
    error: error.name || "ApiError",
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
