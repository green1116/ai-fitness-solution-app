/**
 * V73 P8 — Knowledge layer version lock (read-only)
 */
import {
  V72_INTELLIGENCE_FREEZE_VERSION,
  V72_INTELLIGENCE_SIGNOFF_VERSION,
} from "@/lib/intelligence/v72/signoff/signoff.types";

import { V73_KNOWLEDGE_COMPLIANCE_VERSION } from "../knowledge.compliance";
import { V73_KNOWLEDGE_COMPATIBILITY_VERSION } from "../knowledge.compatibility";
import { V73_KNOWLEDGE_DEPENDENCY_VERSION } from "../knowledge.dependency";
import { V73_KNOWLEDGE_GOVERNANCE_VERSION } from "../knowledge.governance";
import { V73_KNOWLEDGE_POLICY_VERSION } from "../knowledge.policy";
import { V73_KNOWLEDGE_VERSION } from "../knowledge.types";
import { V73_KNOWLEDGE_LIFECYCLE_VERSION } from "../lifecycle.management";

import type { LockVersion } from "./signoff.types";
import { V73_KNOWLEDGE_FREEZE_VERSION, V73_KNOWLEDGE_SIGNOFF_VERSION } from "./signoff.types";

export const V73_KNOWLEDGE_LAYER_VERSION_LOCK: LockVersion = {
  knowledgeCatalog: V73_KNOWLEDGE_VERSION,
  knowledgeDependency: V73_KNOWLEDGE_DEPENDENCY_VERSION,
  knowledgePolicy: V73_KNOWLEDGE_POLICY_VERSION,
  knowledgeCompatibility: V73_KNOWLEDGE_COMPATIBILITY_VERSION,
  knowledgeGovernance: V73_KNOWLEDGE_GOVERNANCE_VERSION,
  knowledgeLifecycle: V73_KNOWLEDGE_LIFECYCLE_VERSION,
  knowledgeCompliance: V73_KNOWLEDGE_COMPLIANCE_VERSION,
  signoff: V73_KNOWLEDGE_SIGNOFF_VERSION,
  freeze: V73_KNOWLEDGE_FREEZE_VERSION,
  upstreamV72IntelligenceSignoff: V72_INTELLIGENCE_SIGNOFF_VERSION,
  upstreamV72IntelligenceFreeze: V72_INTELLIGENCE_FREEZE_VERSION,
};

export const EXPECTED_KNOWLEDGE_LAYER_VERSIONS: LockVersion = V73_KNOWLEDGE_LAYER_VERSION_LOCK;

export function isKnowledgeLayerVersionLockIntact(): boolean {
  const lock = V73_KNOWLEDGE_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function knowledgeVersionLockMatchesExpected(): boolean {
  const lock = V73_KNOWLEDGE_LAYER_VERSION_LOCK;
  const expected = EXPECTED_KNOWLEDGE_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
