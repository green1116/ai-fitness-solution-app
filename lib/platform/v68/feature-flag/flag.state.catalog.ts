/**
 * V68 P4 — Feature flag state catalog (declarative)
 */
import type { FlagStateEntry, FlagStateManifest } from "./governance.types";
import { V68_FEATURE_FLAG_GOVERNANCE_VERSION } from "./governance.types";

export const FLAG_STATE_CATALOG: FlagStateEntry[] = [
  {
    id: "FF-STS-001",
    flagRef: "FF-DEF-001",
    stateKind: "enabled",
    declarativeValue: "true",
    required: true,
    description: "Production API enabled in production",
  },
  {
    id: "FF-STS-002",
    flagRef: "FF-DEF-002",
    stateKind: "enabled",
    declarativeValue: "true",
    required: true,
    description: "Health probe strict mode on",
  },
  {
    id: "FF-STS-003",
    flagRef: "FF-DEF-003",
    stateKind: "enabled",
    declarativeValue: "true",
    required: true,
    description: "Incident auto-escalation active",
  },
  {
    id: "FF-STS-004",
    flagRef: "FF-DEF-004",
    stateKind: "enabled",
    declarativeValue: "true",
    required: true,
    description: "Alert taxonomy routing active",
  },
  {
    id: "FF-STS-005",
    flagRef: "FF-DEF-005",
    stateKind: "rollout",
    declarativeValue: "50",
    required: true,
    description: "On-call paging at 50% rollout",
  },
  {
    id: "FF-STS-006",
    flagRef: "FF-DEF-006",
    stateKind: "enabled",
    declarativeValue: "true",
    required: true,
    description: "Deployment verify gate enforced",
  },
  {
    id: "FF-STS-007",
    flagRef: "FF-DEF-007",
    stateKind: "disabled",
    declarativeValue: "false",
    required: true,
    description: "Readiness probe optional in staging template",
  },
  {
    id: "FF-STS-008",
    flagRef: "FF-DEF-008",
    stateKind: "kill-switch",
    declarativeValue: "false",
    required: true,
    description: "SLO burn-rate alerts kill-switch default off",
  },
];

export function buildFlagStateManifest(): FlagStateManifest {
  const states = FLAG_STATE_CATALOG;
  const stateKinds = new Set(states.map((s) => s.stateKind));
  const catalogComplete = states.length >= 6 && stateKinds.size >= 3;

  return {
    version: V68_FEATURE_FLAG_GOVERNANCE_VERSION,
    entryCount: states.length,
    stateKindCount: stateKinds.size,
    catalogComplete,
    states,
    summary: [
      `flag-states count=${states.length}`,
      `kinds=${stateKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getFlagStateByFlagRef(flagRef: string): FlagStateEntry | undefined {
  return FLAG_STATE_CATALOG.find((s) => s.flagRef === flagRef);
}
