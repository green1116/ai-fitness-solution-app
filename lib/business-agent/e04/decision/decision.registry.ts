/**
 * E04-P4 — Business Decision Registry
 * Decisions bind policies onto E04 processes
 */

import { getProcessById } from "../process/process.registry";
import {
  E04_DECISION_BASE,
  E04_DECISION_FREEZE_VERSION,
  E04_DECISION_RUNTIME_ID,
  E04_DECISION_VERSION,
  DECISION_OUTCOMES,
} from "./decision.constants";
import type {
  DecisionDefinition,
  DecisionPolicyRule,
  DecisionRegistryManifest,
} from "./decision.types";

export const DECISION_POLICY_CATALOG: DecisionPolicyRule[] = [
  {
    id: "e04.policy.compliance-block",
    name: "Compliance Block",
    description: "Reject when compliance gate fails",
    conditions: [
      { field: "compliancePass", op: "falsy", readOnly: true },
    ],
    onMatch: "reject",
    priority: 100,
    readOnly: true,
  },
  {
    id: "e04.policy.high-risk-escalate",
    name: "High Risk Escalate",
    description: "Escalate when risk score is high",
    conditions: [
      { field: "riskScore", op: "gte", value: 80, readOnly: true },
      { field: "compliancePass", op: "truthy", readOnly: true },
    ],
    onMatch: "escalate",
    priority: 80,
    readOnly: true,
  },
  {
    id: "e04.policy.budget-defer",
    name: "Budget Defer",
    description: "Defer when budget is not aligned",
    conditions: [
      { field: "budgetOk", op: "falsy", readOnly: true },
      { field: "compliancePass", op: "truthy", readOnly: true },
    ],
    onMatch: "defer",
    priority: 60,
    readOnly: true,
  },
  {
    id: "e04.policy.ready-approve",
    name: "Ready Approve",
    description: "Approve when compliance and budget pass with moderate risk",
    conditions: [
      { field: "compliancePass", op: "truthy", readOnly: true },
      { field: "budgetOk", op: "truthy", readOnly: true },
      { field: "riskScore", op: "lte", value: 79, readOnly: true },
    ],
    onMatch: "approve",
    priority: 40,
    readOnly: true,
  },
  {
    id: "e04.policy.intake-ready",
    name: "Intake Ready",
    description: "Approve intake when brief present",
    conditions: [
      { field: "hasBrief", op: "truthy", readOnly: true },
    ],
    onMatch: "approve",
    priority: 50,
    readOnly: true,
  },
];

export const DECISION_CATALOG: DecisionDefinition[] = [
  {
    id: "e04.decision.tender-gate",
    name: "Tender Gate Decision",
    description: "Gate enterprise response process by policy outcomes",
    processId: "e04.process.enterprise-response",
    runProcessOn: ["approve", "escalate"],
    defaultOutcome: "defer",
    policyIds: [
      "e04.policy.compliance-block",
      "e04.policy.high-risk-escalate",
      "e04.policy.budget-defer",
      "e04.policy.ready-approve",
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e04.decision.intake-gate",
    name: "Intake Gate Decision",
    description: "Gate intake-only process",
    processId: "e04.process.intake-only",
    runProcessOn: ["approve"],
    defaultOutcome: "reject",
    policyIds: ["e04.policy.intake-ready"],
    optional: true,
    readOnly: true,
  },
];

export function getPolicyById(id: string): DecisionPolicyRule | undefined {
  return DECISION_POLICY_CATALOG.find((p) => p.id === id);
}

export function getDecisionById(id: string): DecisionDefinition | undefined {
  return DECISION_CATALOG.find((d) => d.id === id);
}

export function listPoliciesForDecision(
  decision: DecisionDefinition,
): DecisionPolicyRule[] {
  return decision.policyIds
    .map((id) => getPolicyById(id))
    .filter((p): p is DecisionPolicyRule => Boolean(p));
}

export function assertDecisionDefinition(decision: DecisionDefinition): void {
  if (!decision.id.trim()) throw new Error("decision.id is required");
  if (!decision.name.trim()) throw new Error("decision.name is required");
  if (decision.readOnly !== true) throw new Error("readOnly must be true");
  if (
    !(DECISION_OUTCOMES as readonly string[]).includes(decision.defaultOutcome)
  ) {
    throw new Error(`invalid defaultOutcome: ${decision.defaultOutcome}`);
  }

  const process = getProcessById(decision.processId);
  if (!process) {
    throw new Error(`unknown process: ${decision.processId}`);
  }

  for (const outcome of decision.runProcessOn) {
    if (!(DECISION_OUTCOMES as readonly string[]).includes(outcome)) {
      throw new Error(`invalid runProcessOn outcome: ${outcome}`);
    }
  }

  for (const policyId of decision.policyIds) {
    if (!getPolicyById(policyId)) {
      throw new Error(`unknown policy: ${policyId}`);
    }
  }
}

export function buildDecisionRegistryManifest(
  decisions: DecisionDefinition[] = DECISION_CATALOG,
): DecisionRegistryManifest {
  for (const decision of decisions) {
    assertDecisionDefinition(decision);
  }

  const required = decisions.some((d) => !d.optional);
  if (!required) {
    throw new Error("decision catalog missing required decision");
  }

  return {
    runtimeId: E04_DECISION_RUNTIME_ID,
    version: E04_DECISION_VERSION,
    freezeVersion: E04_DECISION_FREEZE_VERSION,
    base: E04_DECISION_BASE,
    decisionCount: decisions.length,
    policyCount: DECISION_POLICY_CATALOG.length,
    decisions,
    catalogComplete: true,
    readOnly: true,
  };
}

export function listRequiredDecisions(): DecisionDefinition[] {
  return DECISION_CATALOG.filter((d) => !d.optional);
}
