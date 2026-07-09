/**
 * V67 P5 — On-call roster catalog (declarative, aligned with P1 foundation)
 */
import { ONCALL_ROTATION_CATALOG } from "../oncall.contract";

import type { OncallRosterEntry, OncallRosterManifest } from "./governance.types";
import { V67_ONCALL_GOVERNANCE_VERSION } from "./governance.types";

export const ONCALL_ROSTER_CATALOG: OncallRosterEntry[] = [
  {
    id: "OR-001",
    foundationRef: "OC-001",
    role: "platform-oncall",
    tier: "primary",
    shiftKind: "weekly",
    escalationMinutes: 15,
    required: true,
    description: "Primary platform responder — first line production incidents",
  },
  {
    id: "OR-002",
    foundationRef: "OC-002",
    role: "deployer-oncall",
    tier: "secondary",
    shiftKind: "weekly",
    escalationMinutes: 30,
    required: true,
    description: "Secondary deployer for release and rollout incidents",
  },
  {
    id: "OR-003",
    foundationRef: "OC-003",
    role: "security-oncall",
    tier: "escalation",
    shiftKind: "follow-the-sun",
    escalationMinutes: 30,
    required: true,
    description: "Security escalation tier for audit and gate incidents",
  },
  {
    id: "OR-004",
    foundationRef: "OC-004",
    role: "platform-lead",
    tier: "escalation",
    shiftKind: "declarative",
    escalationMinutes: 60,
    required: true,
    description: "Platform lead for extended outage escalation",
  },
  {
    id: "OR-005",
    foundationRef: "OC-005",
    role: "executive-escalation",
    tier: "executive",
    shiftKind: "declarative",
    escalationMinutes: 240,
    required: false,
    description: "Executive escalation for RTO breach / major incident",
  },
  {
    id: "OR-006",
    foundationRef: "OC-006",
    role: "monitoring-oncall",
    tier: "primary",
    shiftKind: "daily",
    escalationMinutes: 15,
    required: true,
    description: "Monitoring on-call for SLO breach and alert routing",
  },
  {
    id: "OR-007",
    foundationRef: "OC-007",
    role: "dr-oncall",
    tier: "secondary",
    shiftKind: "weekly",
    escalationMinutes: 45,
    required: true,
    description: "DR on-call for disaster recovery incidents",
  },
  {
    id: "OR-008",
    foundationRef: "OC-008",
    role: "incident-commander",
    tier: "primary",
    shiftKind: "declarative",
    escalationMinutes: 0,
    required: true,
    description: "Incident commander coordinates response lifecycle",
  },
];

export function buildOncallRosterManifest(): OncallRosterManifest {
  const roster = ONCALL_ROSTER_CATALOG;
  const tiers = new Set(roster.map((r) => r.tier));
  const catalogComplete = roster.length >= 6 && tiers.size >= 3;

  return {
    version: V67_ONCALL_GOVERNANCE_VERSION,
    entryCount: roster.length,
    tierCount: tiers.size,
    catalogComplete,
    roster,
    summary: [
      `oncall-roster entries=${roster.length}`,
      `tiers=${tiers.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getRosterByFoundationRef(foundationRef: string): OncallRosterEntry | undefined {
  return ONCALL_ROSTER_CATALOG.find((r) => r.foundationRef === foundationRef);
}

export function isFoundationOncallAligned(): boolean {
  const foundationIds = new Set(ONCALL_ROTATION_CATALOG.map((r) => r.id));
  return ONCALL_ROSTER_CATALOG.every((r) => foundationIds.has(r.foundationRef));
}
