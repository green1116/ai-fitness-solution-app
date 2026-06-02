import type {
  BuildExecutiveApprovalGateInput,
  ExecutiveApprovalGateResult,
  ExecutiveGateDebugOutput,
} from "../types";

const REASON_LABELS: Record<string, string> = {
  "critical-compliance-risk": "Critical compliance risk",
  "missing-critical-evidence": "Missing critical evidence",
  "weak-ocr-traceability": "Weak OCR traceability",
  "governance-failed": "Governance failed",
  "audit-failed": "Audit failed",
  "validation-unresolved": "Validation unresolved",
};

function statusLabel(status: ExecutiveApprovalGateResult["status"]): string {
  switch (status) {
    case "approved":
      return "APPROVED";
    case "conditional":
      return "CONDITIONAL";
    case "blocked":
      return "BLOCKED";
    default: {
      const s = status as string;
      return s.toUpperCase();
    }
  }
}

export function formatExecutiveGateDebug(input: {
  result: ExecutiveApprovalGateResult;
  input: BuildExecutiveApprovalGateInput;
}): ExecutiveGateDebugOutput {
  const { result } = input;
  const oversight = input.input.executiveOversight;

  const summary = [
    "[ExecutiveGateRuntime]",
    `Gate Status: ${statusLabel(result.status)}`,
    `Releasable: ${result.releasable}`,
    `Executive Score: ${result.executiveScore} / 100`,
    `Gate Recommendation: ${result.recommendation}`,
    `Tender Release: ${result.tenderReleaseDecision}`,
    `Oversight Recommendation: ${oversight.recommendation}`,
  ].join("\n");

  const gateStatus = [
    "Executive Gate Status:",
    `Status: ${statusLabel(result.status)}`,
    `Releasable: ${result.releasable}`,
    `Release Decision: ${result.tenderReleaseDecision}`,
  ].join("\n");

  const blockLines =
    result.reasons.length > 0
      ? result.reasons.map((r) => REASON_LABELS[r] ?? r)
      : ["(none)"];
  const blockReasons = ["Executive Gate Block Reasons:", ...blockLines].join("\n");

  const conditions: string[] = [];
  if (result.status === "conditional") {
    conditions.push("需完成合规会签与列明条件后方可释放");
    if (result.reasons.includes("weak-ocr-traceability")) {
      conditions.push("补充 OCR evidence coordinates");
    }
    if (result.reasons.includes("validation-unresolved")) {
      conditions.push("关闭未解决校验项");
    }
  } else if (result.status === "approved") {
    conditions.push("满足高管放行条件，可授权投标包释放");
  } else {
    conditions.push("不满足释放条件，禁止投标包释放");
  }

  const releaseConditions = ["Executive Release Conditions:", ...conditions].join("\n");

  return {
    summary,
    gateStatus,
    blockReasons,
    releaseConditions,
  };
}
