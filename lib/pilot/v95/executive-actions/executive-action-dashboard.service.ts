/**
 * V95 — Executive action dashboard
 */

import { listExecutiveActionsForOrg } from "./executive-action.store";
import { buildExecutiveActionPipeline } from "./executive-action-pipeline.service";
import { buildGovernanceClosureView } from "./governance-closure.service";
import type { ExecutiveActionDashboard } from "./executive-action.types";
import { V95_EXECUTIVE_ACTIONS_VERSION } from "./executive-action.types";

export function buildExecutiveActionDashboard(
  organizationId: string,
): ExecutiveActionDashboard {
  const pipeline = buildExecutiveActionPipeline(organizationId);
  const closure = buildGovernanceClosureView(organizationId);

  return {
    version: V95_EXECUTIVE_ACTIONS_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    queues: {
      priorityDecision: pipeline.priorityDecision,
      riskMitigation: pipeline.riskMitigation,
      opportunityCapture: pipeline.opportunityCapture,
      overdueAction: pipeline.overdueAction,
    },
    allItems: pipeline.allItems,
    closure,
    summary: {
      total: pipeline.allItems.length,
      priorityDecision: pipeline.priorityDecision.length,
      riskMitigation: pipeline.riskMitigation.length,
      opportunityCapture: pipeline.opportunityCapture.length,
      overdueAction: pipeline.overdueAction.length,
      pending: closure.pendingDecisions.length,
      completed: closure.completedDecisions.length,
      overdue: closure.overdueItems.length,
    },
    recentActions: listExecutiveActionsForOrg(organizationId).slice(0, 20),
    readOnly: true,
  };
}
