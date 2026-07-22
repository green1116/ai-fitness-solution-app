/**
 * Post-Launch P3 — Severity Classification
 */

import {
  INCIDENT_IMPACT_LEVELS,
  INCIDENT_URGENCY_LEVELS,
  OPERATIONS_INCIDENT_SEVERITIES,
} from "./incident.constants";
import type {
  ClassifySeverityInput,
  IncidentImpactLevel,
  IncidentUrgencyLevel,
  OperationsIncidentSeverity,
  SeverityClassification,
} from "./incident.types";

const IMPACT_SCORE: Record<IncidentImpactLevel, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const URGENCY_SCORE: Record<IncidentUrgencyLevel, number> = {
  IMMEDIATE: 4,
  HIGH: 3,
  NORMAL: 2,
  LOW: 1,
};

export function classifyIncidentSeverity(
  input: ClassifySeverityInput,
): SeverityClassification {
  const impact = input.impact;
  const urgency = input.urgency;

  if (!(INCIDENT_IMPACT_LEVELS as readonly string[]).includes(impact)) {
    throw new Error(`invalid incident impact: ${impact}`);
  }
  if (!(INCIDENT_URGENCY_LEVELS as readonly string[]).includes(urgency)) {
    throw new Error(`invalid incident urgency: ${urgency}`);
  }

  const score = IMPACT_SCORE[impact] * 10 + URGENCY_SCORE[urgency];
  let severity: OperationsIncidentSeverity;
  if (score >= 43) severity = "SEV1";
  else if (score >= 33) severity = "SEV2";
  else if (score >= 22) severity = "SEV3";
  else severity = "SEV4";

  if (
    !(OPERATIONS_INCIDENT_SEVERITIES as readonly string[]).includes(severity)
  ) {
    throw new Error(`invalid classified severity: ${severity}`);
  }

  return {
    impact,
    urgency,
    severity,
    score,
    detail: `impact=${impact} urgency=${urgency} -> ${severity}`,
  };
}

export function assertSeverityCompatible(
  severity: OperationsIncidentSeverity,
  impact: IncidentImpactLevel,
  urgency: IncidentUrgencyLevel,
): void {
  const classified = classifyIncidentSeverity({ impact, urgency });
  const order = OPERATIONS_INCIDENT_SEVERITIES;
  const declared = order.indexOf(severity);
  const expected = order.indexOf(classified.severity);
  // Allow declaring equal or higher severity (more severe = lower index)
  if (declared > expected) {
    throw new Error(
      `severity too low: declared=${severity} expected>=${classified.severity}`,
    );
  }
}
