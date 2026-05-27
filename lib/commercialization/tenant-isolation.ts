/**
 * V3.5 tenant isolation foundation compat entry.
 * Minimal pass-through for index.ts module resolution.
 */

export const TENANT_ISOLATION_FOUNDATION_VERSION = "3.5-tenant-isolation-1" as const;

export type TenantIsolationFoundationInput = {
  deploymentId: string;
  mode?: "enterpriseDedicated" | "shared" | "trial";
};

export type TenantIsolationFoundationResult = {
  version: typeof TENANT_ISOLATION_FOUNDATION_VERSION;
  deploymentId: string;
  mode: "enterpriseDedicated" | "shared" | "trial";
  isolated: boolean;
  summary: string;
};

export function runTenantIsolationFoundation(
  input: TenantIsolationFoundationInput,
): TenantIsolationFoundationResult {
  const mode = input.mode ?? "enterpriseDedicated";

  return {
    version: TENANT_ISOLATION_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    mode,
    isolated: true,
    summary: `tenant-isolation=${mode} deploymentId=${input.deploymentId} ready=true`,
  };
}

export function formatTenantIsolationRuntimeHook(
  result: TenantIsolationFoundationResult,
): string {
  return result.summary;
}
