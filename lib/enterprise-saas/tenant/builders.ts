import type {
  Tenant,
  TenantLifecycleEvent,
  TenantLifecycleStage,
  TenantTier,
} from "./types";

export const TENANT_TIERS: TenantTier[] = ["trial", "professional", "enterprise"];

export function buildTenant(input?: {
  deploymentId?: string;
  tier?: TenantTier;
}): Tenant {
  const deploymentId = input?.deploymentId ?? "tenant-default";
  const tier = input?.tier ?? "professional";
  const now = new Date().toISOString();

  return {
    tenantId: `tenant-${deploymentId}`,
    name: `AI Fitness Tenant ${deploymentId}`,
    slug: `tenant-${deploymentId}`,
    tier,
    status: tier === "trial" ? "active" : "active",
    createdAt: now,
    updatedAt: now,
  };
}

export function buildTenantLifecycle(input?: {
  deploymentId?: string;
  tenant?: Tenant;
}): TenantLifecycleEvent[] {
  const deploymentId = input?.deploymentId ?? "tenant-default";
  const tenant = input?.tenant ?? buildTenant({ deploymentId });
  const base = new Date(tenant.createdAt).getTime();

  const sequence: Array<{
    stage: TenantLifecycleStage;
    offsetMinutes: number;
    note: string;
  }> = [
    { stage: "created", offsetMinutes: 0, note: "租户已创建" },
    { stage: "trial-started", offsetMinutes: 1, note: "试用周期开始" },
    { stage: "upgraded", offsetMinutes: 20160, note: "升级至 Professional" },
    { stage: "active", offsetMinutes: 20161, note: "租户正式激活" },
    { stage: "suspended", offsetMinutes: 50000, note: "逾期未付暂停（描述层）" },
    { stage: "cancelled", offsetMinutes: 60000, note: "租户取消订阅" },
  ];

  return sequence.map((item, index) => ({
    eventId: `tenant-lifecycle-${deploymentId}-${index}`,
    tenantId: tenant.tenantId,
    stage: item.stage,
    occurredAt: new Date(base + item.offsetMinutes * 60_000).toISOString(),
    note: item.note,
  }));
}
