/**
 * V67 P2 — Incident lifecycle state catalog (declarative)
 */
import type { IncidentStateDefinition, IncidentStateManifest } from "./lifecycle.types";
import { V67_INCIDENT_LIFECYCLE_VERSION } from "./lifecycle.types";

export const INCIDENT_STATE_CATALOG: IncidentStateDefinition[] = [
  {
    id: "ST-001",
    state: "triggered",
    terminal: false,
    required: true,
    description: "Alert fired; incident not yet triaged",
  },
  {
    id: "ST-002",
    state: "open",
    terminal: false,
    required: true,
    description: "Incident opened and awaiting acknowledgement",
  },
  {
    id: "ST-003",
    state: "acknowledged",
    terminal: false,
    required: true,
    description: "On-call acknowledged ownership",
  },
  {
    id: "ST-004",
    state: "escalated",
    terminal: false,
    required: true,
    description: "Escalated to higher tier per on-call map",
  },
  {
    id: "ST-005",
    state: "mitigating",
    terminal: false,
    required: true,
    description: "Active mitigation in progress",
  },
  {
    id: "ST-006",
    state: "resolved",
    terminal: false,
    required: true,
    description: "Service restored; incident resolved",
  },
  {
    id: "ST-007",
    state: "postmortem",
    terminal: false,
    required: true,
    description: "Post-incident review in progress",
  },
  {
    id: "ST-008",
    state: "closed",
    terminal: true,
    required: true,
    description: "Incident lifecycle complete",
  },
];

export const INCIDENT_LIFECYCLE_STATE_ORDER: IncidentStateDefinition["state"][] = [
  "triggered",
  "open",
  "acknowledged",
  "escalated",
  "mitigating",
  "resolved",
  "postmortem",
  "closed",
];

export function buildIncidentStateManifest(): IncidentStateManifest {
  const states = INCIDENT_STATE_CATALOG;
  const terminalCount = states.filter((s) => s.terminal).length;
  const machineComplete = states.length >= 7 && terminalCount >= 1;

  return {
    version: V67_INCIDENT_LIFECYCLE_VERSION,
    stateCount: states.length,
    terminalCount,
    machineComplete,
    states,
    summary: [
      `incident-states count=${states.length}`,
      `terminal=${terminalCount}`,
      `complete=${machineComplete}`,
    ].join(" "),
  };
}

export function isTerminalIncidentState(state: IncidentStateDefinition["state"]): boolean {
  return INCIDENT_STATE_CATALOG.find((s) => s.state === state)?.terminal === true;
}
