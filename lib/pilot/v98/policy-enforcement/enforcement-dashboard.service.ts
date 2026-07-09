/**
 * V98 — Policy enforcement dashboard
 */

import { listEnforcementActions } from "./enforcement-cache";
import { buildEnforcementView } from "./enforcement-view.service";
import { buildPolicyQueue } from "./policy-engine.service";
import type { PolicyEnforcementDashboard } from "./enforcement.types";
import { V98_POLICY_ENFORCEMENT_VERSION } from "./enforcement.types";

export function buildPolicyEnforcementDashboard(
  organizationId: string,
): PolicyEnforcementDashboard {
  const queues = buildPolicyQueue(organizationId);
  const enforcement = buildEnforcementView(organizationId);
  const actions = listEnforcementActions(organizationId);

  return {
    version: V98_POLICY_ENFORCEMENT_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    queues: {
      reviewDue: queues.reviewDue,
      retentionDue: queues.retentionDue,
      purgeDue: queues.purgeDue,
      exportDue: queues.exportDue,
      holdRequired: queues.holdRequired,
    },
    allItems: queues.allItems,
    enforcement,
    summary: {
      total: queues.allItems.length,
      reviewDue: queues.reviewDue.length,
      retentionDue: queues.retentionDue.length,
      purgeDue: queues.purgeDue.length,
      exportDue: queues.exportDue.length,
      holdRequired: queues.holdRequired.length,
      blocked: enforcement.blockedItems.length,
      enforced: queues.allItems.filter((i) => i.policyStatus === "enforced").length,
      actionsTaken: actions.length,
    },
    recentActions: actions.slice(0, 20),
    readOnly: true,
  };
}
