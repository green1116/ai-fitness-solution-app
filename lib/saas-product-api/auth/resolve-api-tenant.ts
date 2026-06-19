import type { SaasRequestSessionHeaders } from "@/lib/saas-runtime/auth/auth-types";
import { resolveTenantContext } from "@/lib/saas-runtime/tenant-context/resolve-tenant-context";
import {
  SAAS_CONTEXT_ERROR_CODES,
  isSaasContextError,
} from "@/lib/saas-runtime/tenant-context/context-errors";
import { API_ERROR_CODES, SaasProductApiError, apiTenantRequired, apiUnauthorized } from "../shared/api-errors";

export interface ResolvedApiTenant {
  tenantId: string;
  userId: string;
}

function toSessionHeaders(headers: Headers): SaasRequestSessionHeaders {
  return {
    userId: headers.get("x-user-id"),
    email: headers.get("x-user-email"),
  };
}

function mapContextError(error: unknown): never {
  if (isSaasContextError(error)) {
    if (error.code === SAAS_CONTEXT_ERROR_CODES.AUTH_REQUIRED) {
      throw apiUnauthorized(error.message);
    }
    if (error.code === SAAS_CONTEXT_ERROR_CODES.TENANT_CONTEXT_NOT_FOUND) {
      throw apiTenantRequired(error.message);
    }
    if (error.code === SAAS_CONTEXT_ERROR_CODES.INVALID_SESSION) {
      throw apiUnauthorized(error.message);
    }
  }
  if (error instanceof SaasProductApiError) {
    throw error;
  }
  const message = error instanceof Error ? error.message : "Failed to resolve tenant context";
  throw new SaasProductApiError(API_ERROR_CODES.API_INTERNAL_ERROR, message, 500);
}

export async function resolveApiTenant(headers: Headers): Promise<ResolvedApiTenant> {
  try {
    const ctx = await resolveTenantContext(toSessionHeaders(headers));
    const tenantId = ctx.tenantId?.trim();
    const userId = ctx.userId?.trim();
    if (!tenantId || !userId) {
      throw apiTenantRequired("tenantId and userId are required");
    }
    return { tenantId, userId };
  } catch (error) {
    mapContextError(error);
  }
}
