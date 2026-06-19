import { PORTAL_ERROR_CODES, SaasProductPortalError } from "../shared/portal-errors";
import type { SaasProductApiResponseBody } from "../shared/portal-types";

export interface SaasProductApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface SaasProductApiRequestOptions {
  headers?: Record<string, string>;
  body?: unknown;
}

function joinUrl(baseUrl: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function assertSaasProductApiPath(path: string): void {
  if (!path.startsWith("/api/saas-product")) {
    throw new SaasProductPortalError(
      PORTAL_ERROR_CODES.PORTAL_API_ERROR,
      `Portal API client only allows /api/saas-product paths, got: ${path}`,
      500,
    );
  }
}

export class SaasProductApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: SaasProductApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "";
    this.defaultHeaders = options.headers ?? {};
  }

  async get<T>(path: string, options: SaasProductApiRequestOptions = {}): Promise<T> {
    return this.request<T>("GET", path, options);
  }

  async post<T>(path: string, options: SaasProductApiRequestOptions = {}): Promise<T> {
    return this.request<T>("POST", path, options);
  }

  async patch<T>(path: string, options: SaasProductApiRequestOptions = {}): Promise<T> {
    return this.request<T>("PATCH", path, options);
  }

  private async request<T>(
    method: "GET" | "POST" | "PATCH",
    path: string,
    options: SaasProductApiRequestOptions,
  ): Promise<T> {
    assertSaasProductApiPath(path);

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...this.defaultHeaders,
      ...options.headers,
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(joinUrl(this.baseUrl, path), {
      method,
      headers,
      credentials: "include",
      cache: "no-store",
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const payload = (await response.json().catch(() => null)) as SaasProductApiResponseBody<T> | null;

    if (!payload || payload.ok !== true) {
      const message =
        payload && payload.ok === false
          ? payload.message ?? "Portal API request failed"
          : "Portal API request failed";
      const code =
        payload && payload.ok === false ? payload.code ?? PORTAL_ERROR_CODES.PORTAL_API_ERROR : PORTAL_ERROR_CODES.PORTAL_API_ERROR;
      if (response.status === 401) {
        throw new SaasProductPortalError(PORTAL_ERROR_CODES.PORTAL_UNAUTHORIZED, message, 401);
      }
      throw new SaasProductPortalError(
        code === PORTAL_ERROR_CODES.PORTAL_UNAUTHORIZED
          ? PORTAL_ERROR_CODES.PORTAL_UNAUTHORIZED
          : PORTAL_ERROR_CODES.PORTAL_API_ERROR,
        message,
        response.status,
      );
    }

    return payload.data;
  }
}

export function createSaasProductApiClient(options: SaasProductApiClientOptions = {}): SaasProductApiClient {
  return new SaasProductApiClient(options);
}
