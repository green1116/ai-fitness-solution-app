import type {
  BuildExecutiveApprovalGateInput,
  ExecutiveApprovalGatePackage,
  ExecutiveApprovalGateResult,
  ExecutiveGateReason,
  ExecutiveGatePolicy,
  TenderReleaseDecision,
} from "../types";
import {
  DEFAULT_EXECUTIVE_GATE_POLICY,
  EXECUTIVE_APPROVAL_GATE_RUNTIME_VERSION,
} from "../types";
import { formatExecutiveGateDebug } from "../debug/executiveGateDebug";
import {
  auditPassed,
  governancePassed,
  hasCriticalCompliance,
  ocrTraceabilityComplete,
} from "./buildExecutiveFindings";

const BLOCK_REASONS: ExecutiveGateReason[] = [
  "critical-compliance-risk",
  "missing-critical-evidence",
  "governance-failed",
  "audit-failed",
];

const CONDITIONAL_REASONS: ExecutiveGateReason[] = [
  "weak-ocr-traceability",
  "validation-unresolved",
];

function collectGateReasons(input: BuildExecutiveApprovalGateInput): ExecutiveGateReason[] {
  const reasons: ExecutiveGateReason[] = [];

  if (hasCriticalCompliance(input)) {
    reasons.push("critical-compliance-risk");
  }

  const mandatoryMissing = input.coverage?.summary.mandatoryMissing ?? 0;
  const criticalCoverageGap =
    mandatoryMissing > 0 ||
    (input.coverage?.requirements.some(
      (r) => r.analysis.mandatory && (r.status === "missing" || r.status === "conflict"),
    ) ??
      false);
  if (criticalCoverageGap) {
    reasons.push("missing-critical-evidence");
  }

  if (!ocrTraceabilityComplete(input)) {
    reasons.push("weak-ocr-traceability");
  }

  if (!governancePassed(input)) {
    reasons.push("governance-failed");
  }

  if (!auditPassed(input)) {
    reasons.push("audit-failed");
  }

  const unresolvedValidation =
    input.validation?.outcome === "conditional" ||
    input.validation?.outcome === "rejected" ||
    (input.validation?.complianceChecks.some((c) => !c.passed) ?? false);
  if (unresolvedValidation) {
    reasons.push("validation-unresolved");
  }

  return [...new Set(reasons)];
}

function resolveGateOutcome(input: {
  reasons: ExecutiveGateReason[];
  oversight: BuildExecutiveApprovalGateInput["executiveOversight"];
  policy: Required<Pick<ExecutiveGatePolicy, "minReleaseScore" | "allowConditionalRelease">>;
}): Pick<
  ExecutiveApprovalGateResult,
  "status" | "releasable" | "recommendation" | "tenderReleaseDecision"
> {
  const { reasons, oversight, policy } = input;
  const score = oversight.executiveScore;

  const hasBlockReason = reasons.some((r) => BLOCK_REASONS.includes(r));
  const oversightReject = oversight.recommendation === "reject";
  const scoreTooLow = score < policy.minReleaseScore;

  if (hasBlockReason || oversightReject || scoreTooLow) {
    return {
      status: "blocked",
      releasable: false,
      recommendation: "block-release",
      tenderReleaseDecision: "release-denied",
    };
  }

  const hasConditionalReason = reasons.some((r) => CONDITIONAL_REASONS.includes(r));
  const oversightConditional =
    oversight.recommendation === "conditional-approve" ||
    oversight.recommendation === "review-required";

  if (hasConditionalReason || oversightConditional) {
    const releasable =
      policy.allowConditionalRelease &&
      oversight.recommendation === "conditional-approve" &&
      score >= policy.minReleaseScore;
    return {
      status: "conditional",
      releasable,
      recommendation: "conditional-release",
      tenderReleaseDecision: "release-held",
    };
  }

  if (
    oversight.recommendation === "approve" &&
    oversight.executiveApproved &&
    score >= policy.minReleaseScore
  ) {
    return {
      status: "approved",
      releasable: true,
      recommendation: "release",
      tenderReleaseDecision: "release-authorized",
    };
  }

  return {
    status: "blocked",
    releasable: false,
    recommendation: "block-release",
    tenderReleaseDecision: "release-denied",
  };
}

/**
 * V3.4-E10 Executive Approval Gate Runtime（确定性）
 *
 * Executive Oversight → Gate Reasons → Release Decision
 */
export function buildExecutiveApprovalGate(
  input: BuildExecutiveApprovalGateInput,
  policy?: ExecutiveGatePolicy,
): ExecutiveApprovalGatePackage {
  const resolvedPolicy = { ...DEFAULT_EXECUTIVE_GATE_POLICY, ...policy };
  const reasons = collectGateReasons(input);
  const executiveScore = input.executiveOversight.executiveScore;

  const outcome = resolveGateOutcome({
    reasons,
    oversight: input.executiveOversight,
    policy: resolvedPolicy,
  });

  const result: ExecutiveApprovalGateResult = {
    ...outcome,
    reasons,
    executiveScore,
  };

  const debug = formatExecutiveGateDebug({ result, input });

  return {
    version: EXECUTIVE_APPROVAL_GATE_RUNTIME_VERSION,
    ...result,
    debug,
  };
}
