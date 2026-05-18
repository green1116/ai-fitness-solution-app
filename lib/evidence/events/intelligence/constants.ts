import type { RuntimeEventType } from "../types";
import type { TimelinePhase } from "./types";

export const EVENT_PHASE_MAP: Record<RuntimeEventType, TimelinePhase> = {
  OCR_COMPLETED: "ocr",
  COVERAGE_RE_EVALUATED: "coverage",
  VALIDATION_RECHECKED: "validation",
  VALIDATION_FAILED: "validation",
  VALIDATION_PASSED: "validation",
  AUDIT_APPROVED: "audit",
  AUDIT_REJECTED: "audit",
  GOVERNANCE_ESCALATED: "governance",
  GOVERNANCE_APPROVED: "governance",
  GOVERNANCE_FAILED: "governance",
  RELEASE_BLOCKED: "release",
  RELEASE_ENABLED: "release",
  EXECUTIVE_REVIEW_UNLOCKED: "executive",
  EXECUTIVE_APPROVED: "executive",
  EXECUTIVE_REJECTED: "executive",
  MANIFEST_GENERATION_REQUESTED: "executive",
  STATE_TRANSITIONED: "state",
};

export const FAILURE_EVENTS = new Set<RuntimeEventType>([
  "VALIDATION_FAILED",
  "AUDIT_REJECTED",
  "GOVERNANCE_FAILED",
  "GOVERNANCE_ESCALATED",
  "RELEASE_BLOCKED",
  "EXECUTIVE_REJECTED",
]);

export const ESCALATION_EVENTS = new Set<RuntimeEventType>([
  "GOVERNANCE_ESCALATED",
  "GOVERNANCE_FAILED",
  "EXECUTIVE_REVIEW_UNLOCKED",
  "RELEASE_BLOCKED",
]);

/** E16 确定性因果链（用于关联图） */
export const KNOWN_CAUSAL_CHAINS: Array<{
  chain: RuntimeEventType[];
  reason: string;
}> = [
  {
    chain: ["OCR_COMPLETED", "COVERAGE_RE_EVALUATED", "VALIDATION_RECHECKED"],
    reason: "ocr-triggers-coverage-and-validation-recheck",
  },
  {
    chain: ["VALIDATION_FAILED", "GOVERNANCE_ESCALATED", "RELEASE_BLOCKED"],
    reason: "validation-failure-governance-freeze",
  },
  {
    chain: ["AUDIT_APPROVED", "EXECUTIVE_REVIEW_UNLOCKED"],
    reason: "audit-clears-executive-review",
  },
  {
    chain: ["GOVERNANCE_APPROVED", "RELEASE_ENABLED"],
    reason: "governance-approves-release",
  },
  {
    chain: ["EXECUTIVE_APPROVED", "MANIFEST_GENERATION_REQUESTED"],
    reason: "executive-requests-manifest",
  },
];

export const LIFECYCLE_PHASE_ORDER: TimelinePhase[] = [
  "ocr",
  "coverage",
  "validation",
  "audit",
  "governance",
  "executive",
  "release",
  "state",
];
