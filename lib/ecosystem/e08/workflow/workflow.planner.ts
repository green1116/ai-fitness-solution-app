/**
 * E08-P4 — Cross Enterprise Workflow Planner
 * Composes ordered partner-exchange plans from workflow definitions
 */

import { getListingById } from "../exchange/exchange.registry";
import { assertWorkflowDefinition } from "./workflow.registry";
import type {
  WorkflowDefinition,
  WorkflowPlan,
  WorkflowPlanStep,
} from "./workflow.types";

export function planWorkflow(workflow: WorkflowDefinition): WorkflowPlan {
  assertWorkflowDefinition(workflow);

  const steps: WorkflowPlanStep[] = workflow.listingIds.map(
    (listingId, index) => {
      const listing = getListingById(listingId);
      if (!listing) {
        throw new Error(`unknown listing ${listingId} on ${workflow.id}`);
      }
      return {
        id: `${workflow.id}.step-${index + 1}`,
        order: index + 1,
        listingId: listing.id,
        exchangeCategory: listing.category,
        networkId: listing.networkId,
        title: listing.title,
        detail: `${listing.description} → network ${listing.networkId}`,
        readOnly: true,
      };
    },
  );

  const narrative = [
    `${workflow.name} plans ${steps.length} partner exchanges`,
    `for goal "${workflow.goal}"`,
    `(${steps.map((s) => s.exchangeCategory).join(" → ")})`,
  ].join(" ");

  return {
    workflowId: workflow.id,
    kind: workflow.kind,
    goal: workflow.goal,
    stepCount: steps.length,
    steps: Object.freeze([...steps]) as WorkflowPlanStep[],
    narrative,
    readOnly: true,
  };
}
