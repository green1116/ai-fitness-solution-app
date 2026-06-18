import {
  PDI_MIN_DELIVERY_HIGH_RISK_COUNT,
  PDI_MIN_DELIVERY_ISSUE_COUNT,
  PDI_MIN_DELIVERY_OPEN_ISSUE_COUNT,
  PDI_MIN_DELIVERY_RISK_COUNT,
} from "../shared/constants";
import { buildDeliveryIssueRegistry } from "./delivery-issue-registry";
import { buildDeliveryRiskRegistry } from "./delivery-risk-registry";
import type { RiskIssueLayerValidation } from "./risk-issue-types";

export function validateRiskIssueLayer(): RiskIssueLayerValidation {
  const risks = buildDeliveryRiskRegistry();
  const issues = buildDeliveryIssueRegistry();

  const valid =
    risks.count >= PDI_MIN_DELIVERY_RISK_COUNT &&
    issues.count >= PDI_MIN_DELIVERY_ISSUE_COUNT &&
    risks.highRiskCount >= PDI_MIN_DELIVERY_HIGH_RISK_COUNT &&
    issues.openIssueCount >= PDI_MIN_DELIVERY_OPEN_ISSUE_COUNT;

  const summary = [
    `risks=${risks.count}`,
    `issues=${issues.count}`,
    `highRisks=${risks.highRiskCount}`,
    `openIssues=${issues.openIssueCount}`,
  ].join(" ");

  return {
    valid,
    riskCount: risks.count,
    issueCount: issues.count,
    highRiskCount: risks.highRiskCount,
    openIssueCount: issues.openIssueCount,
    summary,
  };
}
