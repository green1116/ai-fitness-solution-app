/**
 * V66 P7 — Incident escalation map (declarative catalog)
 */
import type { EscalationEntry, EscalationMapManifest } from "./ops.types";
import { V66_DEPLOYMENT_OPS_VERSION } from "./ops.types";

export const ESCALATION_MAP: EscalationEntry[] = [
  {
    id: "ESC-001",
    level: "L1",
    trigger: "Single health check warn",
    role: "oncall",
    action: "Review /api/production/health and observability logs",
    required: true,
  },
  {
    id: "ESC-002",
    level: "L1",
    trigger: "Verify chain failure on pre-deploy",
    role: "deployer",
    action: "Halt rollout; run npm run verify:v66-deployment",
    required: true,
  },
  {
    id: "ESC-003",
    level: "L2",
    trigger: "Prisma preflight or migration safety fail",
    role: "platform",
    action: "Block deploy; review prisma:diff and migration-safety output",
    required: true,
  },
  {
    id: "ESC-004",
    level: "L2",
    trigger: "Security gate blocked",
    role: "security",
    action: "Review security.policy.catalog and v92:env-audit",
    required: true,
  },
  {
    id: "ESC-005",
    level: "L2",
    trigger: "Rollback guard tripped",
    role: "oncall",
    action: "Execute rollback.guard rollbackAction references",
    required: true,
  },
  {
    id: "ESC-006",
    level: "L3",
    trigger: "Production outage or data integrity concern",
    role: "platform",
    action: "Initiate DR restore checklist; contact database provider",
    required: true,
  },
  {
    id: "ESC-007",
    level: "L3",
    trigger: "Secrets exposure suspected",
    role: "security",
    action: "Rotate secrets; run v92:env-audit; block deploy",
    required: true,
  },
  {
    id: "ESC-008",
    level: "L4",
    trigger: "Extended outage (>4h RTO breach)",
    role: "platform",
    action: "Executive escalation; full DR recovery per retention matrix",
    required: true,
  },
  {
    id: "ESC-009",
    level: "L4",
    trigger: "Frozen layer integrity compromised",
    role: "platform",
    action: "Halt all deploys; restore from recovery point inventory",
    required: true,
  },
  {
    id: "ESC-010",
    level: "L1",
    trigger: "Post-deploy verify pass",
    role: "operator",
    action: "Close incident; document in ops event catalog",
    required: false,
  },
];

export function buildEscalationMapManifest(): EscalationMapManifest {
  const entries = ESCALATION_MAP;
  const levels = new Set(entries.map((e) => e.level));
  const mapComplete = entries.length >= 8 && levels.size >= 4;

  return {
    version: V66_DEPLOYMENT_OPS_VERSION,
    entryCount: entries.length,
    levelCount: levels.size,
    mapComplete,
    entries,
    summary: [
      `escalation-map entries=${entries.length}`,
      `levels=${levels.size}`,
      `complete=${mapComplete}`,
    ].join(" "),
  };
}

export function getEscalationByLevel(level: EscalationEntry["level"]): EscalationEntry[] {
  return ESCALATION_MAP.filter((e) => e.level === level);
}
