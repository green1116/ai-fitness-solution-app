import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildDeliveryRiskRegistry } from "./delivery-risk-registry";
import { calculateDeliveryIssueSeverity } from "./issue-scoring";
import type { DeliveryIssueRecord, DeliveryIssueRegistry } from "./risk-issue-types";

const ESCALATION_SCORE_THRESHOLD = 40;

function shouldEscalateToIssue(risk: ReturnType<typeof buildDeliveryRiskRegistry>["records"][number]): boolean {
  return risk.riskLevel === "high" || risk.riskScore >= ESCALATION_SCORE_THRESHOLD;
}

function resolveIssueStatus(
  index: number,
  severity: DeliveryIssueRecord["severity"],
): DeliveryIssueRecord["status"] {
  if (severity === "critical") {
    if (index < 3) return "open";
    if (index < 5) return "mitigating";
    return "closed";
  }
  if (severity === "major") {
    if (index < 2) return "open";
    return index % 2 === 0 ? "mitigating" : "closed";
  }
  return index % 3 === 0 ? "open" : "closed";
}

let cachedRegistry: DeliveryIssueRegistry | undefined;

export function buildDeliveryIssueRegistry(): DeliveryIssueRegistry {
  if (cachedRegistry) return cachedRegistry;

  const escalated = buildDeliveryRiskRegistry()
    .records.filter(shouldEscalateToIssue)
    .sort((left, right) => right.riskScore - left.riskScore);

  const records: DeliveryIssueRecord[] = escalated.map((risk, index) => {
    const severity = calculateDeliveryIssueSeverity(risk.riskScore);
    return {
      issueId: `pdi-issue-${risk.riskId}`,
      projectId: risk.projectId,
      riskId: risk.riskId,
      severity,
      status: resolveIssueStatus(index, severity),
      riskScore: risk.riskScore,
    };
  });

  cachedRegistry = {
    registryId: "pdi-delivery-issue-registry-v45-p3",
    records,
    count: records.length,
    openIssueCount: records.filter((record) => record.status === "open").length,
    mode: PDI_CANONICAL_ID,
  };

  return cachedRegistry;
}
