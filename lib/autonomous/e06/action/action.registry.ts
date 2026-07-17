/**
 * E06-P2 — Business Action Registry
 * Actions bind onto E06 autonomous operations
 */

import { getOperationById } from "../core/operation.registry";
import {
  E06_ACTION_BASE,
  E06_ACTION_FREEZE_VERSION,
  E06_ACTION_RUNTIME_ID,
  E06_ACTION_VERSION,
  ACTION_KINDS,
} from "./action.constants";
import type {
  ActionDefinition,
  ActionKind,
  ActionRegistryManifest,
} from "./action.types";

export const ACTION_CATALOG: ActionDefinition[] = [
  {
    id: "e06.action.notify-opportunity",
    kind: "notify",
    name: "Notify Opportunity",
    description: "Emit opportunity signal notification from observe loop",
    operationId: "e06.op.observe-opportunity",
    effect: "opportunity-signal-notified",
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.action.dispatch-pricing",
    kind: "dispatch",
    name: "Dispatch Pricing Decision",
    description: "Dispatch pricing recommendation to downstream consumers",
    operationId: "e06.op.decide-pricing",
    effect: "pricing-decision-dispatched",
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.action.adjust-risk",
    kind: "adjust",
    name: "Adjust Risk Posture",
    description: "Apply risk mitigation adjustment from act loop",
    operationId: "e06.op.act-risk",
    effect: "risk-posture-adjusted",
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.action.verify-compliance",
    kind: "verify",
    name: "Verify Compliance",
    description: "Verify compliance readiness from monitor loop",
    operationId: "e06.op.monitor-compliance",
    effect: "compliance-verified",
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.action.report-delivery",
    kind: "report",
    name: "Report Delivery Escalation",
    description: "Report delivery escalation forecast",
    operationId: "e06.op.escalate-delivery",
    effect: "delivery-escalation-reported",
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.action.orchestrate-synthesis",
    kind: "orchestrate",
    name: "Orchestrate Synthesis",
    description: "Orchestrate cross-domain synthesis coordination",
    operationId: "e06.op.coordinate-synthesis",
    effect: "synthesis-orchestrated",
    optional: false,
    readOnly: true,
  },
];

export function assertActionDefinition(action: ActionDefinition): void {
  if (!action.id.trim()) throw new Error("action.id is required");
  if (!action.name.trim()) throw new Error("action.name is required");
  if (!(ACTION_KINDS as readonly string[]).includes(action.kind)) {
    throw new Error(`invalid action kind: ${action.kind}`);
  }
  if (!action.effect.trim()) throw new Error("action.effect is required");
  if (action.readOnly !== true) throw new Error("readOnly must be true");

  if (!getOperationById(action.operationId)) {
    throw new Error(`missing E06 operation: ${action.operationId}`);
  }
}

export function getActionById(id: string): ActionDefinition | undefined {
  return ACTION_CATALOG.find((a) => a.id === id);
}

export function getActionByKind(kind: ActionKind): ActionDefinition | undefined {
  return ACTION_CATALOG.find((a) => a.kind === kind);
}

export function listActionsForOperation(
  operationId: string,
): ActionDefinition[] {
  return ACTION_CATALOG.filter((a) => a.operationId === operationId);
}

export function buildActionRegistryManifest(
  actions: ActionDefinition[] = ACTION_CATALOG,
): ActionRegistryManifest {
  for (const action of actions) {
    assertActionDefinition(action);
  }

  const kinds = [...new Set(actions.map((a) => a.kind))];
  const catalogComplete = ACTION_KINDS.every((k) => kinds.includes(k));
  if (!catalogComplete) {
    throw new Error("Action catalog incomplete: missing kinds");
  }

  return {
    runtimeId: E06_ACTION_RUNTIME_ID,
    version: E06_ACTION_VERSION,
    freezeVersion: E06_ACTION_FREEZE_VERSION,
    base: E06_ACTION_BASE,
    actionCount: actions.length,
    kinds,
    actions,
    catalogComplete: true,
    readOnly: true,
  };
}
