import { buildDeliveryProject } from "../workspace/builders";
import type { LedgerEntry, LedgerEventType } from "./types";
import { LEDGER_EVENT_TYPES } from "./types";

const EVENT_MESSAGES: Record<LedgerEventType, string> = {
  created: "交付项目已创建",
  approved: "交付物已通过审批",
  delivered: "交付包已发布给客户",
  downloaded: "客户已下载交付包",
};

export function buildLedgerEntries(input?: {
  deploymentId?: string;
  projectId?: string;
}): LedgerEntry[] {
  const deploymentId = input?.deploymentId ?? "ledger-default";
  const project = buildDeliveryProject({ deploymentId });
  const projectId = input?.projectId ?? project.projectId;
  const now = Date.now();

  return LEDGER_EVENT_TYPES.map((eventType, index) => ({
    entryId: `ledger-${eventType}-${deploymentId}`,
    projectId,
    eventType,
    actor: eventType === "downloaded" ? "customer" : "system",
    message: EVENT_MESSAGES[eventType],
    recordedAt: new Date(now - (LEDGER_EVENT_TYPES.length - index) * 3600_000).toISOString(),
  }));
}

export function buildDeliveryLedger(input?: { deploymentId?: string }) {
  const deploymentId = input?.deploymentId ?? "ledger-default";
  const project = buildDeliveryProject({ deploymentId });
  const entries = buildLedgerEntries({ deploymentId, projectId: project.projectId });

  return {
    ledgerId: `ledger-${deploymentId}`,
    projectId: project.projectId,
    entries,
    eventCount: entries.length,
  };
}
