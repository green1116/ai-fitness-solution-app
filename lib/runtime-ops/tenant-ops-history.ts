/**
 * WP-RUNTIME-OPS-TENANT-HISTORY-1
 * Read tenant_ops.* CRMActivity with Customer ownership validation.
 * No meta.org-only access — org boundary is getCustomerById first.
 */

import { getCustomerById } from "@/lib/crm/customer/customer.service";
import { prisma } from "@/lib/prisma";
import {
  TENANT_OPS_AUDIT_TYPES,
  type TenantOpsAuditMeta,
} from "@/lib/runtime-ops/tenant-ops-audit";

export const TENANT_OPS_HISTORY_ID = "tenant-ops-history-1" as const;
export const TENANT_OPS_HISTORY_VERSION =
  "runtime-ops-tenant-history-1" as const;

export const TENANT_OPS_ACTIVITY_TYPES = [
  TENANT_OPS_AUDIT_TYPES.review,
  TENANT_OPS_AUDIT_TYPES.recover,
  TENANT_OPS_AUDIT_TYPES.execute,
] as const;

export type TenantOpsHistoryEntry = Readonly<{
  id: string;
  type: (typeof TENANT_OPS_ACTIVITY_TYPES)[number] | string;
  timestamp: Date;
  meta: Record<string, unknown> | null;
}>;

function asMetaRecord(meta: unknown): Record<string, unknown> | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  return meta as Record<string, unknown>;
}

function metaString(
  meta: Record<string, unknown> | null,
  key: keyof TenantOpsAuditMeta | string,
): string {
  if (!meta) return "";
  const value = meta[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * List tenant Ops audit rows for an org-owned customer.
 * Optional itemId filters meta.itemId.
 * When meta.organizationId is present, it must match organizationId.
 */
export async function listTenantOpsHistory(input: {
  organizationId: string;
  customerId: string;
  itemId?: string;
  take?: number;
}): Promise<readonly TenantOpsHistoryEntry[]> {
  const organizationId = input.organizationId.trim();
  const customerId = input.customerId.trim();
  const itemId = input.itemId?.trim() ?? "";
  const takeRaw = input.take ?? 50;
  const take = Math.min(Math.max(Math.floor(takeRaw), 1), 100);

  if (!organizationId || !customerId) return [];

  const customer = await getCustomerById(customerId, organizationId);
  if (!customer) return [];

  const fetchTake = itemId ? Math.min(take * 5, 200) : take;
  const rows = await prisma.cRMActivity.findMany({
    where: {
      customerId,
      type: { in: [...TENANT_OPS_ACTIVITY_TYPES] },
    },
    orderBy: { timestamp: "desc" },
    take: fetchTake,
    select: {
      id: true,
      type: true,
      timestamp: true,
      meta: true,
    },
  });

  const out: TenantOpsHistoryEntry[] = [];
  for (const row of rows) {
    const meta = asMetaRecord(row.meta);
    const metaOrg = metaString(meta, "organizationId");
    if (metaOrg && metaOrg !== organizationId) {
      continue;
    }
    if (itemId) {
      const metaItem = metaString(meta, "itemId");
      if (metaItem !== itemId) continue;
    }
    out.push({
      id: row.id,
      type: row.type,
      timestamp: row.timestamp,
      meta,
    });
    if (out.length >= take) break;
  }

  return out;
}
