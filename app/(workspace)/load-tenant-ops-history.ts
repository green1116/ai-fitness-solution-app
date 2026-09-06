"use server";

import { resolveTenantOpsOrgContext } from "@/lib/runtime-ops/tenant-ops-org-gate";
import {
  listTenantOpsHistory,
  type TenantOpsHistoryEntry,
} from "@/lib/runtime-ops/tenant-ops-history";
import { runWithTenantContext } from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("loadTenantOpsHistory is server-only");
}

export type TenantOpsHistoryLoadEntry = Readonly<{
  id: string;
  type: string;
  timestamp: string;
  action: string | null;
  result: string | null;
  reason: string | null;
  failureClass: string | null;
}>;

export type TenantOpsHistoryLoadResult = Readonly<{
  ok: boolean;
  reason: string;
  organizationId: string;
  customerId: string;
  itemId: string;
  entries: readonly TenantOpsHistoryLoadEntry[];
}>;

function metaField(
  meta: Record<string, unknown> | null,
  key: string,
): string | null {
  if (!meta) return null;
  const value = meta[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toLoadEntry(entry: TenantOpsHistoryEntry): TenantOpsHistoryLoadEntry {
  const meta = entry.meta;
  return {
    id: entry.id,
    type: entry.type,
    timestamp:
      entry.timestamp instanceof Date
        ? entry.timestamp.toISOString()
        : String(entry.timestamp),
    action: metaField(meta, "action"),
    result: metaField(meta, "result"),
    reason: metaField(meta, "reason"),
    failureClass: metaField(meta, "failureClass"),
  };
}

function failed(
  partial: Pick<
    TenantOpsHistoryLoadResult,
    "organizationId" | "customerId" | "itemId" | "reason"
  >,
): TenantOpsHistoryLoadResult {
  return {
    ok: false,
    reason: partial.reason,
    organizationId: partial.organizationId,
    customerId: partial.customerId,
    itemId: partial.itemId,
    entries: [],
  };
}

/**
 * Lazy item history load. Ownership: org membership + Customer via listTenantOpsHistory.
 * Read path — no role mutate gate.
 */
export async function loadTenantOpsHistory(input: {
  organizationId: string;
  customerId: string;
  itemId: string;
}): Promise<TenantOpsHistoryLoadResult> {
  const organizationId = String(input.organizationId ?? "").trim();
  const customerId = String(input.customerId ?? "").trim();
  const itemId = String(input.itemId ?? "").trim();

  const gate = await resolveTenantOpsOrgContext({
    organizationId,
    traceId: "tenant-ops-history-load",
  });
  if (!gate.ok) {
    return failed({
      organizationId: gate.organizationId,
      customerId,
      itemId,
      reason: gate.reason,
    });
  }
  if (!customerId) {
    return failed({
      organizationId: gate.tenant.organizationId,
      customerId: "",
      itemId,
      reason: "customer-id-missing",
    });
  }
  if (!itemId) {
    return failed({
      organizationId: gate.tenant.organizationId,
      customerId,
      itemId: "",
      reason: "item-id-missing",
    });
  }

  const entries = await runWithTenantContext(gate.tenant, async () =>
    listTenantOpsHistory({
      organizationId: gate.tenant.organizationId,
      customerId,
      itemId,
      take: 10,
    }),
  );

  return {
    ok: true,
    reason: "loaded",
    organizationId: gate.tenant.organizationId,
    customerId,
    itemId,
    entries: entries.map(toLoadEntry),
  };
}
