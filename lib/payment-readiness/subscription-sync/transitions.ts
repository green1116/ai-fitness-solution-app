import type {
  SubscriptionSyncAction,
  SubscriptionSyncEvent,
  SubscriptionSyncTransition,
} from "./types";

export const SUBSCRIPTION_SYNC_ACTIONS: SubscriptionSyncAction[] = [
  "activate",
  "renew",
  "suspend",
  "cancel",
  "expire",
];

const TRANSITION_DEFS: Array<{
  action: SubscriptionSyncAction;
  fromStatus: SubscriptionSyncTransition["fromStatus"];
  toStatus: SubscriptionSyncTransition["toStatus"];
  description: string;
  reversible: boolean;
}> = [
  {
    action: "activate",
    fromStatus: "none",
    toStatus: "active",
    description: "首次支付成功后激活订阅",
    reversible: false,
  },
  {
    action: "renew",
    fromStatus: "active",
    toStatus: "renewing",
    description: "续费周期开始，更新账期",
    reversible: false,
  },
  {
    action: "suspend",
    fromStatus: "active",
    toStatus: "suspended",
    description: "逾期未付，暂停服务访问",
    reversible: true,
  },
  {
    action: "cancel",
    fromStatus: "active",
    toStatus: "cancelled",
    description: "用户主动取消，期末失效",
    reversible: false,
  },
  {
    action: "expire",
    fromStatus: "cancelled",
    toStatus: "expired",
    description: "订阅到期，权益回收",
    reversible: false,
  },
];

export function buildSubscriptionSyncTransitions(): SubscriptionSyncTransition[] {
  return TRANSITION_DEFS.map((def) => ({
    action: def.action,
    fromStatus: def.fromStatus,
    toStatus: def.toStatus,
    description: def.description,
    reversible: def.reversible,
  }));
}

export function buildSubscriptionSyncLifecycle(input?: {
  deploymentId?: string;
}): SubscriptionSyncEvent[] {
  const deploymentId = input?.deploymentId ?? "subscription-sync-default";
  const subscriptionId = `subscription-${deploymentId}`;
  const base = new Date().toISOString();

  const sequence: Array<{
    action: SubscriptionSyncAction;
    fromStatus: SubscriptionSyncEvent["fromStatus"];
    toStatus: SubscriptionSyncEvent["toStatus"];
    offsetMinutes: number;
  }> = [
    { action: "activate", fromStatus: "none", toStatus: "active", offsetMinutes: 0 },
    { action: "renew", fromStatus: "active", toStatus: "renewing", offsetMinutes: 43200 },
    { action: "suspend", fromStatus: "active", toStatus: "suspended", offsetMinutes: 45000 },
    { action: "cancel", fromStatus: "active", toStatus: "cancelled", offsetMinutes: 46000 },
    { action: "expire", fromStatus: "cancelled", toStatus: "expired", offsetMinutes: 525600 },
  ];

  return sequence.map((item, index) => ({
    eventId: `sub-sync-${deploymentId}-${index}`,
    subscriptionId,
    action: item.action,
    fromStatus: item.fromStatus,
    toStatus: item.toStatus,
    occurredAt: new Date(
      new Date(base).getTime() + item.offsetMinutes * 60_000,
    ).toISOString(),
    mode: "readiness-stub" as const,
  }));
}
