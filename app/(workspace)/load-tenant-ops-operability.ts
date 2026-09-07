"use server";

import { resolveTenantOpsOrgContext } from "@/lib/runtime-ops/tenant-ops-org-gate";
import {
  readTenantOpsOperability,
  type TenantOpsOperabilityProjection,
} from "@/lib/runtime-ops/tenant-ops-operability";
import { runWithTenantContext } from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("loadTenantOpsOperability is server-only");
}

export type TenantOpsOperabilityLoadResult = Readonly<{
  ok: boolean;
  reason: string;
  organizationId: string;
  projection: TenantOpsOperabilityProjection | null;
}>;

function failed(
  organizationId: string,
  reason: string,
): TenantOpsOperabilityLoadResult {
  return {
    ok: false,
    reason,
    organizationId,
    projection: null,
  };
}

function parseOptionalDate(value: string | Date | undefined): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(+value) ? undefined : value;
  }
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const date = new Date(trimmed);
  return Number.isNaN(+date) ? undefined : date;
}

/**
 * Org-scoped operability load. Membership via resolveTenantOpsOrgContext.
 * Read path — no role mutate gate. Optional since/until/windowMs timeWindow.
 */
export async function loadTenantOpsOperability(input: {
  organizationId: string;
  since?: string | Date;
  until?: string | Date;
  windowMs?: number;
  take?: number;
}): Promise<TenantOpsOperabilityLoadResult> {
  const organizationId = String(input.organizationId ?? "").trim();
  const gate = await resolveTenantOpsOrgContext({
    organizationId,
    traceId: "tenant-ops-operability-load",
  });
  if (!gate.ok) {
    return failed(gate.organizationId, gate.reason);
  }

  const since = parseOptionalDate(input.since);
  const until = parseOptionalDate(input.until);
  const windowMs =
    typeof input.windowMs === "number" && Number.isFinite(input.windowMs)
      ? input.windowMs
      : since
        ? undefined
        : 24 * 60 * 60 * 1000;

  const projection = await runWithTenantContext(gate.tenant, async () =>
    readTenantOpsOperability({
      organizationId: gate.tenant.organizationId,
      since,
      until,
      windowMs,
      take: input.take,
    }),
  );

  return {
    ok: true,
    reason: "loaded",
    organizationId: gate.tenant.organizationId,
    projection,
  };
}
