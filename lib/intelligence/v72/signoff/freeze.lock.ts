/**
 * V72 P8 — Intelligence layer version lock (read-only)
 */
import {
  V71_WORKFLOW_FREEZE_VERSION,
  V71_WORKFLOW_SIGNOFF_VERSION,
} from "@/lib/orchestration/v71/signoff/signoff.types";

import { V72_INTELLIGENCE_VERSION } from "../intelligence.types";
import { V72_INTELLIGENCE_COMPLIANCE_VERSION } from "../intelligence.compliance";
import { V72_INTELLIGENCE_COMPATIBILITY_VERSION } from "../intelligence.compatibility";
import { V72_INTELLIGENCE_GOVERNANCE_VERSION } from "../intelligence.governance";
import { V72_INTELLIGENCE_LIFECYCLE_VERSION } from "../lifecycle.management";
import { V72_INTELLIGENCE_POLICY_VERSION } from "../intelligence.policy";
import { V72_SIGNAL_DEPENDENCY_VERSION } from "../signal.dependency";

import type { LockVersion } from "./signoff.types";
import { V72_INTELLIGENCE_FREEZE_VERSION, V72_INTELLIGENCE_SIGNOFF_VERSION } from "./signoff.types";

export const V72_INTELLIGENCE_LAYER_VERSION_LOCK: LockVersion = {
  intelligenceCatalog: V72_INTELLIGENCE_VERSION,
  signalDependency: V72_SIGNAL_DEPENDENCY_VERSION,
  intelligencePolicy: V72_INTELLIGENCE_POLICY_VERSION,
  intelligenceCompatibility: V72_INTELLIGENCE_COMPATIBILITY_VERSION,
  intelligenceGovernance: V72_INTELLIGENCE_GOVERNANCE_VERSION,
  intelligenceLifecycle: V72_INTELLIGENCE_LIFECYCLE_VERSION,
  intelligenceCompliance: V72_INTELLIGENCE_COMPLIANCE_VERSION,
  signoff: V72_INTELLIGENCE_SIGNOFF_VERSION,
  freeze: V72_INTELLIGENCE_FREEZE_VERSION,
  upstreamV71WorkflowSignoff: V71_WORKFLOW_SIGNOFF_VERSION,
  upstreamV71WorkflowFreeze: V71_WORKFLOW_FREEZE_VERSION,
};

export const EXPECTED_INTELLIGENCE_LAYER_VERSIONS: LockVersion =
  V72_INTELLIGENCE_LAYER_VERSION_LOCK;

export function isIntelligenceLayerVersionLockIntact(): boolean {
  const lock = V72_INTELLIGENCE_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function intelligenceVersionLockMatchesExpected(): boolean {
  const lock = V72_INTELLIGENCE_LAYER_VERSION_LOCK;
  const expected = EXPECTED_INTELLIGENCE_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
