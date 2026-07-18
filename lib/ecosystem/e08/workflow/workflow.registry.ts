/**
 * E08-P4 — Cross Enterprise Workflow Registry
 * Workflows bind ordered partner-exchange listing sequences
 */

import { getListingById } from "../exchange/exchange.registry";
import {
  E08_WORKFLOW_BASE,
  E08_WORKFLOW_FREEZE_VERSION,
  E08_WORKFLOW_ID,
  E08_WORKFLOW_VERSION,
  WORKFLOW_KINDS,
} from "./workflow.constants";
import type {
  WorkflowDefinition,
  WorkflowKind,
  WorkflowRegistryManifest,
} from "./workflow.types";

export const WORKFLOW_CATALOG: WorkflowDefinition[] = [
  {
    id: "e08.workflow.supply-fulfill",
    name: "Supply Fulfillment Workflow",
    kind: "fulfill",
    goal: "Fulfill cross-enterprise supply through partner exchange",
    description: "Exchange the supply capability listing end-to-end",
    listingIds: ["e08.exchange.supply-capability"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.workflow.market-expand",
    name: "Market Expansion Workflow",
    kind: "expand",
    goal: "Expand from supply into go-to-market distribution",
    description:
      "Exchange supply then distribution capabilities across enterprises",
    listingIds: [
      "e08.exchange.supply-capability",
      "e08.exchange.distribution-capability",
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.workflow.enterprise-handoff",
    name: "Enterprise Handoff Workflow",
    kind: "handoff",
    goal: "Hand off supply → distribution → governance across the ecosystem",
    description: "Exchange all three partner capability listings in sequence",
    listingIds: [
      "e08.exchange.supply-capability",
      "e08.exchange.distribution-capability",
      "e08.exchange.governance-capability",
    ],
    optional: false,
    readOnly: true,
  },
];

export function assertWorkflowDefinition(workflow: WorkflowDefinition): void {
  if (!workflow.id.trim()) throw new Error("workflow.id is required");
  if (!workflow.name.trim()) throw new Error("workflow.name is required");
  if (!workflow.goal.trim()) throw new Error("workflow.goal is required");
  if (!(WORKFLOW_KINDS as readonly string[]).includes(workflow.kind)) {
    throw new Error(`invalid workflow kind: ${workflow.kind}`);
  }
  if (workflow.readOnly !== true) throw new Error("readOnly must be true");
  if (workflow.listingIds.length === 0) {
    throw new Error(`workflow ${workflow.id} requires listings`);
  }

  for (const listingId of workflow.listingIds) {
    const listing = getListingById(listingId);
    if (!listing) {
      throw new Error(`unknown listing ${listingId} on ${workflow.id}`);
    }
    if (listing.listingStatus !== "exchangeable") {
      throw new Error(
        `listing ${listingId} is not exchangeable on ${workflow.id}`,
      );
    }
  }
}

export function getWorkflowById(id: string): WorkflowDefinition | undefined {
  return WORKFLOW_CATALOG.find((w) => w.id === id);
}

export function getWorkflowByKind(
  kind: WorkflowKind,
): WorkflowDefinition | undefined {
  return WORKFLOW_CATALOG.find((w) => w.kind === kind);
}

export function listWorkflowsForListing(
  listingId: string,
): WorkflowDefinition[] {
  return WORKFLOW_CATALOG.filter((w) => w.listingIds.includes(listingId));
}

export function buildWorkflowRegistryManifest(
  workflows: WorkflowDefinition[] = WORKFLOW_CATALOG,
): WorkflowRegistryManifest {
  for (const workflow of workflows) {
    assertWorkflowDefinition(workflow);
  }

  const kinds = [...new Set(workflows.map((w) => w.kind))];
  const catalogComplete = WORKFLOW_KINDS.every((k) => kinds.includes(k));
  if (!catalogComplete) {
    throw new Error("Workflow catalog incomplete: missing kinds");
  }

  return {
    workflowId: E08_WORKFLOW_ID,
    version: E08_WORKFLOW_VERSION,
    freezeVersion: E08_WORKFLOW_FREEZE_VERSION,
    base: E08_WORKFLOW_BASE,
    workflowCount: workflows.length,
    kinds,
    workflows,
    catalogComplete: true,
    readOnly: true,
  };
}
