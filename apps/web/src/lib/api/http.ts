import { clientConfig } from "../../config";

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, string | number | boolean | null | undefined | object>;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode: number;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorPayload: ApiErrorResponse;

  constructor(payload: ApiErrorResponse) {
    super(payload.message || payload.error || "An API error occurred");
    this.name = "ApiError";
    this.statusCode = payload.statusCode;
    this.errorPayload = payload;
  }
}

const API_BASE_URL = clientConfig.apiUrl;



function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cliniq_token");
}

export async function httpClient<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  options?: RequestOptions
): Promise<T> {
  const url = new URL(
    endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  );

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers || {}),
  };

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let errorJson: { error?: string; message?: string } = {};
    try {
      errorJson = (await response.json()) as { error?: string; message?: string };
    } catch {
      errorJson = { error: response.statusText };
    }

    throw new ApiError({
      error: errorJson.error || "HTTP Error",
      message: errorJson.message || `Request failed with status ${response.status}`,
      statusCode: response.status,
    });
  }

  return (await response.json()) as T;
}

export const http = {
  get: <T>(endpoint: string, options?: RequestOptions) => httpClient<T>(endpoint, "GET", options),
  post: <T>(
    endpoint: string,
    body?: RequestOptions["body"],
    options?: Omit<RequestOptions, "body">
  ) => httpClient<T>(endpoint, "POST", { ...options, body }),
  put: <T>(
    endpoint: string,
    body?: RequestOptions["body"],
    options?: Omit<RequestOptions, "body">
  ) => httpClient<T>(endpoint, "PUT", { ...options, body }),
  patch: <T>(
    endpoint: string,
    body?: RequestOptions["body"],
    options?: Omit<RequestOptions, "body">
  ) => httpClient<T>(endpoint, "PATCH", { ...options, body }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    httpClient<T>(endpoint, "DELETE", options),
};
