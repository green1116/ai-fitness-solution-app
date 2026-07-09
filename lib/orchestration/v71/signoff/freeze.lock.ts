/**
 * V71 P8 — Workflow layer version lock (read-only)
 */
import {
  V70_DELIVERY_FREEZE_VERSION,
  V70_DELIVERY_SIGNOFF_VERSION,
} from "@/lib/delivery/v70/signoff/signoff.types";

import { V71_ORCHESTRATION_VERSION } from "../orchestration.types";
import { V71_WORKFLOW_COMPLIANCE_VERSION } from "../workflow.compliance";
import { V71_WORKFLOW_DEPENDENCY_VERSION } from "../workflow.dependency";
import { V71_WORKFLOW_GOVERNANCE_VERSION } from "../workflow.governance";
import { V71_WORKFLOW_LIFECYCLE_VERSION } from "../lifecycle.management";
import { V71_WORKFLOW_POLICY_VERSION } from "../workflow.policy";
import { V71_WORKFLOW_COMPATIBILITY_VERSION } from "../workflow.compatibility";

import type { LockVersion } from "./signoff.types";
import { V71_WORKFLOW_FREEZE_VERSION, V71_WORKFLOW_SIGNOFF_VERSION } from "./signoff.types";

export const V71_WORKFLOW_LAYER_VERSION_LOCK: LockVersion = {
  orchestrationCatalog: V71_ORCHESTRATION_VERSION,
  workflowDependency: V71_WORKFLOW_DEPENDENCY_VERSION,
  workflowPolicy: V71_WORKFLOW_POLICY_VERSION,
  workflowCompatibility: V71_WORKFLOW_COMPATIBILITY_VERSION,
  workflowGovernance: V71_WORKFLOW_GOVERNANCE_VERSION,
  workflowLifecycle: V71_WORKFLOW_LIFECYCLE_VERSION,
  workflowCompliance: V71_WORKFLOW_COMPLIANCE_VERSION,
  signoff: V71_WORKFLOW_SIGNOFF_VERSION,
  freeze: V71_WORKFLOW_FREEZE_VERSION,
  upstreamV70DeliverySignoff: V70_DELIVERY_SIGNOFF_VERSION,
  upstreamV70DeliveryFreeze: V70_DELIVERY_FREEZE_VERSION,
};

export const EXPECTED_WORKFLOW_LAYER_VERSIONS: LockVersion = V71_WORKFLOW_LAYER_VERSION_LOCK;

export function isWorkflowLayerVersionLockIntact(): boolean {
  const lock = V71_WORKFLOW_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function workflowVersionLockMatchesExpected(): boolean {
  const lock = V71_WORKFLOW_LAYER_VERSION_LOCK;
  const expected = EXPECTED_WORKFLOW_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
