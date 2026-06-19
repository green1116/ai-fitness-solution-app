import type { Prisma } from "@prisma/client";
import {
  DEFAULT_PORTAL_TYPE,
  SaasLifecycleError,
  SAAS_LIFECYCLE_ERROR_CODES,
} from "../shared/constants";
import type { CreateTenantInput } from "../shared/types";

export type SaasLifecycleDb = Prisma.TransactionClient;

export function slugifyTenantName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const suffix = Date.now().toString(36);
  return `${base || "tenant"}-${suffix}`;
}

export function validateBootstrapTenantInput(input: {
  userId?: string;
  tenantName?: string;
  organizationName?: string;
  workspaceName?: string;
}): void {
  if (!input.userId?.trim()) {
    throw new SaasLifecycleError(SAAS_LIFECYCLE_ERROR_CODES.INVALID_BOOTSTRAP_INPUT, "userId is required");
  }
  if (!input.tenantName?.trim() || input.tenantName.trim().length < 2) {
    throw new SaasLifecycleError(SAAS_LIFECYCLE_ERROR_CODES.INVALID_BOOTSTRAP_INPUT, "tenantName is invalid");
  }
  if (!input.organizationName?.trim() || input.organizationName.trim().length < 2) {
    throw new SaasLifecycleError(
      SAAS_LIFECYCLE_ERROR_CODES.INVALID_BOOTSTRAP_INPUT,
      "organizationName is invalid",
    );
  }
  if (!input.workspaceName?.trim() || input.workspaceName.trim().length < 2) {
    throw new SaasLifecycleError(SAAS_LIFECYCLE_ERROR_CODES.INVALID_BOOTSTRAP_INPUT, "workspaceName is invalid");
  }
}

export async function createTenant(db: SaasLifecycleDb, input: CreateTenantInput) {
  return db.saasTenant.create({
    data: {
      slug: slugifyTenantName(input.name),
      name: input.name.trim(),
      status: input.status ?? "active",
      portalType: input.portalType ?? DEFAULT_PORTAL_TYPE,
    },
  });
}
