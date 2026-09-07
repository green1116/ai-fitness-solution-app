/**
 * WP-POST-GA-TENANT-OPS-OPERABILITY-1
 * Read-only org + timeWindow projection over tenant_ops.* CRMActivity.
 * Ownership: Customer.organizationId only — no meta.org-only access.
 */

import { prisma } from "@/lib/prisma";
import { classifyTenantOpsFailure } from "@/lib/runtime-ops/tenant-ops-failure";
import { TENANT_OPS_ACTIVITY_TYPES } from "@/lib/runtime-ops/tenant-ops-history";

export const TENANT_OPS_OPERABILITY_ID = "tenant-ops-operability-1" as const;
export const TENANT_OPS_OPERABILITY_VERSION =
  "post-ga-tenant-ops-operability-1" as const;

export type TenantOpsOperabilityTimeWindow = Readonly<{
  since: Date;
  until: Date;
}>;

export type TenantOpsOperabilityProjection = Readonly<{
  workPackageId: typeof TENANT_OPS_OPERABILITY_ID;
  version: typeof TENANT_OPS_OPERABILITY_VERSION;
  organizationId: string;
  since: string;
  until: string;
  total: number;
  success: number;
  failed: number;
  retryable: number;
  terminal: number;
  byAction: Readonly<Record<string, number>>;
  byFailureClass: Readonly<Record<string, number>>;
}>;

export type TenantOpsOperabilityRow = Readonly<{
  type: string;
  meta: Record<string, unknown> | null;
}>;

function asMetaRecord(meta: unknown): Record<string, unknown> | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  return meta as Record<string, unknown>;
}

function metaString(
  meta: Record<string, unknown> | null,
  key: string,
): string {
  if (!meta) return "";
  const value = meta[key];
  return typeof value === "string" ? value.trim() : "";
}

function emptyCounts(): Record<string, number> {
  return {};
}

function bump(map: Record<string, number>, key: string) {
  const k = key.trim() || "unknown";
  map[k] = (map[k] ?? 0) + 1;
}

export function emptyTenantOpsOperabilityProjection(input: {
  organizationId: string;
  since: Date;
  until: Date;
}): TenantOpsOperabilityProjection {
  return {
    workPackageId: TENANT_OPS_OPERABILITY_ID,
    version: TENANT_OPS_OPERABILITY_VERSION,
    organizationId: input.organizationId.trim(),
    since: input.since.toISOString(),
    until: input.until.toISOString(),
    total: 0,
    success: 0,
    failed: 0,
    retryable: 0,
    terminal: 0,
    byAction: {},
    byFailureClass: {},
  };
}

/**
 * Pure aggregation over already ownership-filtered rows.
 * Used by readTenantOpsOperability and static verify.
 */
export function aggregateTenantOpsOperabilityRows(
  rows: readonly TenantOpsOperabilityRow[],
  organizationId: string,
  window: TenantOpsOperabilityTimeWindow,
): TenantOpsOperabilityProjection {
  const orgId = organizationId.trim();
  const byAction = emptyCounts();
  const byFailureClass = emptyCounts();
  let total = 0;
  let success = 0;
  let failed = 0;
  let retryable = 0;
  let terminal = 0;

  for (const row of rows) {
    const meta = asMetaRecord(row.meta);
    const metaOrg = metaString(meta, "organizationId");
    if (metaOrg && metaOrg !== orgId) continue;

    total += 1;
    const action =
      metaString(meta, "action") ||
      row.type.replace(/^tenant_ops\./, "") ||
      "unknown";
    bump(byAction, action);

    const result = metaString(meta, "result").toUpperCase();
    if (result === "SUCCESS") {
      success += 1;
      continue;
    }

    failed += 1;
    const reason = metaString(meta, "reason");
    const explicit = metaString(meta, "failureClass").toUpperCase();
    const failureClass =
      explicit === "RETRYABLE" || explicit === "TERMINAL"
        ? explicit
        : classifyTenantOpsFailure(reason || "failed");
    bump(byFailureClass, failureClass);
    if (failureClass === "RETRYABLE") retryable += 1;
    else terminal += 1;
  }

  return {
    workPackageId: TENANT_OPS_OPERABILITY_ID,
    version: TENANT_OPS_OPERABILITY_VERSION,
    organizationId: orgId,
    since: window.since.toISOString(),
    until: window.until.toISOString(),
    total,
    success,
    failed,
    retryable,
    terminal,
    byAction,
    byFailureClass,
  };
}

function normalizeWindow(input: {
  since?: Date;
  until?: Date;
  windowMs?: number;
}): TenantOpsOperabilityTimeWindow | null {
  const until = input.until ?? new Date();
  if (!(until instanceof Date) || Number.isNaN(+until)) return null;

  let since = input.since;
  if (!since && typeof input.windowMs === "number" && Number.isFinite(input.windowMs)) {
    const ms = Math.max(0, Math.floor(input.windowMs));
    since = new Date(+until - ms);
  }
  if (!since || !(since instanceof Date) || Number.isNaN(+since)) return null;
  if (+since > +until) return null;
  return { since, until };
}

/**
 * Org-scoped operability projection for tenant_ops.* activities in a time window.
 * Customers are selected by Customer.organizationId; activities filtered by type + timestamp.
 */
export async function readTenantOpsOperability(input: {
  organizationId: string;
  since?: Date;
  until?: Date;
  /** Alternate to since: look back windowMs from until (default now). */
  windowMs?: number;
  take?: number;
}): Promise<TenantOpsOperabilityProjection> {
  const organizationId = input.organizationId.trim();
  const window = normalizeWindow({
    since: input.since,
    until: input.until,
    windowMs: input.windowMs,
  });

  if (!organizationId || !window) {
    return emptyTenantOpsOperabilityProjection({
      organizationId,
      since: input.since ?? new Date(0),
      until: input.until ?? new Date(),
    });
  }

  const takeRaw = input.take ?? 500;
  const take = Math.min(Math.max(Math.floor(takeRaw), 1), 2000);

  const customers = await prisma.customer.findMany({
    where: { organizationId },
    select: { id: true },
    take: 200,
  });

  if (customers.length === 0) {
    return emptyTenantOpsOperabilityProjection({
      organizationId,
      since: window.since,
      until: window.until,
    });
  }

  const customerIds = customers.map((c) => c.id);
  const rows = await prisma.cRMActivity.findMany({
    where: {
      customerId: { in: customerIds },
      type: { in: [...TENANT_OPS_ACTIVITY_TYPES] },
      timestamp: {
        gte: window.since,
        lte: window.until,
      },
    },
    orderBy: { timestamp: "desc" },
    take,
    select: {
      type: true,
      meta: true,
    },
  });

  return aggregateTenantOpsOperabilityRows(
    rows.map((row) => ({
      type: row.type,
      meta: asMetaRecord(row.meta),
    })),
    organizationId,
    window,
  );
}
