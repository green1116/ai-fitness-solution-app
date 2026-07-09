/**
 * V67 P1 — On-call contract catalog (declarative, read-only)
 */
import type { OncallContractManifest, OncallRotationEntry } from "./foundation.types";
import { V67_MONITORING_FOUNDATION_VERSION } from "./foundation.types";

export const ONCALL_ROTATION_CATALOG: OncallRotationEntry[] = [
  {
    id: "OC-001",
    tier: "primary",
    role: "platform-oncall",
    escalationMinutes: 15,
    required: true,
    description: "First responder for production incidents",
  },
  {
    id: "OC-002",
    tier: "secondary",
    role: "deployer-oncall",
    escalationMinutes: 30,
    required: true,
    description: "Deployment and release incidents",
  },
  {
    id: "OC-003",
    tier: "escalation",
    role: "security-oncall",
    escalationMinutes: 30,
    required: true,
    description: "Security gate and env audit incidents",
  },
  {
    id: "OC-004",
    tier: "escalation",
    role: "platform-lead",
    escalationMinutes: 60,
    required: true,
    description: "Extended outage escalation",
  },
  {
    id: "OC-005",
    tier: "executive",
    role: "executive-escalation",
    escalationMinutes: 240,
    required: false,
    description: "RTO breach / major incident",
  },
  {
    id: "OC-006",
    tier: "primary",
    role: "monitoring-oncall",
    escalationMinutes: 15,
    required: true,
    description: "SLO breach and alert routing",
  },
  {
    id: "OC-007",
    tier: "secondary",
    role: "dr-oncall",
    escalationMinutes: 45,
    required: true,
    description: "Disaster recovery incidents — V66 DR reference",
  },
  {
    id: "OC-008",
    tier: "primary",
    role: "incident-commander",
    escalationMinutes: 0,
    required: true,
    description: "Coordinates incident response lifecycle",
  },
];

export function buildOncallContractManifest(): OncallContractManifest {
  const rotations = ONCALL_ROTATION_CATALOG;
  const tiers = new Set(rotations.map((r) => r.tier));
  const contractComplete = rotations.length >= 6 && tiers.size >= 3;

  return {
    version: V67_MONITORING_FOUNDATION_VERSION,
    entryCount: rotations.length,
    tierCount: tiers.size,
    contractComplete,
    rotations,
    summary: [
      `oncall-contract entries=${rotations.length}`,
      `tiers=${tiers.size}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function getOncallByTier(tier: OncallRotationEntry["tier"]): OncallRotationEntry[] {
  return ONCALL_ROTATION_CATALOG.filter((r) => r.tier === tier);
}
