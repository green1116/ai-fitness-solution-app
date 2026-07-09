/**
 * V67 P5 — Response target catalog (declarative SLA targets)
 */
import type { ResponseTargetEntry, ResponseTargetKind, ResponseTargetManifest } from "./governance.types";
import { V67_ONCALL_GOVERNANCE_VERSION } from "./governance.types";

export const RESPONSE_TARGET_CATALOG: ResponseTargetEntry[] = [
  {
    id: "RT-001",
    severityRef: "P0",
    kind: "page",
    targetMinutes: 0,
    foundationOncallRef: "OC-001",
    pageRequired: true,
    required: true,
    description: "P0 immediate page to primary on-call",
  },
  {
    id: "RT-002",
    severityRef: "P0",
    kind: "acknowledge",
    targetMinutes: 5,
    sloRef: "SLOT-006",
    foundationOncallRef: "OC-001",
    pageRequired: true,
    required: true,
    description: "P0 acknowledge within 5 minutes",
  },
  {
    id: "RT-003",
    severityRef: "P0",
    kind: "mitigate",
    targetMinutes: 30,
    foundationOncallRef: "OC-001",
    pageRequired: true,
    required: true,
    description: "P0 mitigation target within 30 minutes",
  },
  {
    id: "RT-004",
    severityRef: "P0",
    kind: "resolve",
    targetMinutes: 60,
    sloRef: "SLOT-006",
    foundationOncallRef: "OC-008",
    pageRequired: true,
    required: true,
    description: "P0 resolution target within 60 minutes (MTTR SLO)",
  },
  {
    id: "RT-005",
    severityRef: "P1",
    kind: "acknowledge",
    targetMinutes: 15,
    foundationOncallRef: "OC-001",
    pageRequired: true,
    required: true,
    description: "P1 acknowledge within 15 minutes",
  },
  {
    id: "RT-006",
    severityRef: "P1",
    kind: "resolve",
    targetMinutes: 240,
    foundationOncallRef: "OC-002",
    pageRequired: true,
    required: true,
    description: "P1 resolution target within 4 hours",
  },
  {
    id: "RT-007",
    severityRef: "P2",
    kind: "acknowledge",
    targetMinutes: 60,
    foundationOncallRef: "OC-006",
    pageRequired: false,
    required: true,
    description: "P2 acknowledge within business hours SLA",
  },
  {
    id: "RT-008",
    severityRef: "P3",
    kind: "acknowledge",
    targetMinutes: 240,
    foundationOncallRef: "OC-006",
    pageRequired: false,
    required: true,
    description: "P3 low-priority backlog acknowledgement",
  },
];

export function buildResponseTargetManifest(): ResponseTargetManifest {
  const targets = RESPONSE_TARGET_CATALOG;
  const kinds = new Set(targets.map((t) => t.kind));
  const catalogComplete = targets.length >= 6 && kinds.size >= 3;

  return {
    version: V67_ONCALL_GOVERNANCE_VERSION,
    targetCount: targets.length,
    kindCount: kinds.size,
    catalogComplete,
    targets,
    summary: [
      `response-targets count=${targets.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getResponseTargetsBySeverity(
  severityRef: ResponseTargetEntry["severityRef"],
): ResponseTargetEntry[] {
  return RESPONSE_TARGET_CATALOG.filter((t) => t.severityRef === severityRef);
}

export function computeDeclarativeResponseWindow(input: {
  severityRef: ResponseTargetEntry["severityRef"];
  kind: ResponseTargetKind;
}): number {
  const match = RESPONSE_TARGET_CATALOG.find(
    (t) => t.severityRef === input.severityRef && t.kind === input.kind,
  );
  return match?.targetMinutes ?? 0;
}
