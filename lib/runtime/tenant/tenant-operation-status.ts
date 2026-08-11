/**
 * RSO-5 — Tenant operation status contract
 * Projection vocabulary for TenantOperations.
 */

export const TENANT_OPERATION_STATUSES = [
  "STABLE",
  "WATCH",
  "STAGED",
  "SUSPENDED",
] as const;
export type TenantOperationStatus =
  (typeof TENANT_OPERATION_STATUSES)[number];

export const TENANT_OPERATIONS_SURFACE_STATUSES = [
  "NOMINAL",
  "ATTENTION",
  "CONSTRAINED",
] as const;
export type TenantOperationsSurfaceStatus =
  (typeof TENANT_OPERATIONS_SURFACE_STATUSES)[number];

export type TenantOperation = Readonly<{
  operationId: string;
  tenantId: string;
  sourceActionId: string;
  sourceCheckId: string;
  status: TenantOperationStatus;
  summary: string;
  detail: string;
  ordinal: number;
}>;

/** Map recovery action status to tenant operation status. */
export function tenantOperationStatusFromRecovery(
  status: "IDLE" | "PLANNED" | "ARMED" | "HELD",
): TenantOperationStatus {
  if (status === "IDLE") return "STABLE";
  if (status === "PLANNED") return "WATCH";
  if (status === "ARMED") return "STAGED";
  return "SUSPENDED";
}

/** Aggregate tenant operation statuses into surface status. */
export function aggregateTenantOperationsSurfaceStatus(
  statuses: readonly TenantOperationStatus[],
): TenantOperationsSurfaceStatus {
  if (statuses.length === 0) return "NOMINAL";
  if (statuses.some((s) => s === "SUSPENDED")) return "CONSTRAINED";
  if (statuses.some((s) => s === "WATCH" || s === "STAGED")) return "ATTENTION";
  return "NOMINAL";
}
