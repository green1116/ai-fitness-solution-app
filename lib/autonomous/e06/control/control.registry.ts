/**
 * E06-P4 — Enterprise Control Registry
 * Controls bind workflows onto the enterprise control plane
 */

import { getWorkflowById } from "../workflow/workflow.registry";
import {
  E06_CONTROL_BASE,
  E06_CONTROL_FREEZE_VERSION,
  E06_CONTROL_PLANE_ID,
  E06_CONTROL_VERSION,
  CONTROL_MODES,
} from "./control.constants";
import type {
  ControlDefinition,
  ControlMode,
  ControlRegistryManifest,
} from "./control.types";

export const CONTROL_CATALOG: ControlDefinition[] = [
  {
    id: "e06.control.response-auto",
    name: "Automatic Response Control",
    mode: "automatic",
    description: "Run enterprise response workflow autonomously",
    workflowId: "e06.workflow.enterprise-response",
    priority: 100,
    healthThreshold: 1,
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.control.risk-supervised",
    name: "Supervised Risk Guard Control",
    mode: "supervised",
    description: "Run risk guard workflow under supervision",
    workflowId: "e06.workflow.risk-guard",
    priority: 80,
    healthThreshold: 1,
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.control.escalation-fallback",
    name: "Fallback Escalation Control",
    mode: "fallback",
    description: "Run delivery escalation workflow as fallback path",
    workflowId: "e06.workflow.delivery-escalation",
    priority: 60,
    healthThreshold: 1,
    optional: false,
    readOnly: true,
  },
];

export function assertControlDefinition(control: ControlDefinition): void {
  if (!control.id.trim()) throw new Error("control.id is required");
  if (!control.name.trim()) throw new Error("control.name is required");
  if (!(CONTROL_MODES as readonly string[]).includes(control.mode)) {
    throw new Error(`invalid control mode: ${control.mode}`);
  }
  if (control.readOnly !== true) throw new Error("readOnly must be true");
  if (control.healthThreshold < 0 || control.healthThreshold > 1) {
    throw new Error(`invalid healthThreshold on ${control.id}`);
  }

  if (!getWorkflowById(control.workflowId)) {
    throw new Error(`missing E06 workflow: ${control.workflowId}`);
  }
}

export function getControlById(id: string): ControlDefinition | undefined {
  return CONTROL_CATALOG.find((c) => c.id === id);
}

export function getControlByMode(
  mode: ControlMode,
): ControlDefinition | undefined {
  return CONTROL_CATALOG.find((c) => c.mode === mode);
}

export function buildControlRegistryManifest(
  controls: ControlDefinition[] = CONTROL_CATALOG,
): ControlRegistryManifest {
  for (const control of controls) {
    assertControlDefinition(control);
  }

  const modes = [...new Set(controls.map((c) => c.mode))];
  const catalogComplete = CONTROL_MODES.every((m) => modes.includes(m));
  if (!catalogComplete) {
    throw new Error("Control catalog incomplete: missing modes");
  }

  return {
    planeId: E06_CONTROL_PLANE_ID,
    version: E06_CONTROL_VERSION,
    freezeVersion: E06_CONTROL_FREEZE_VERSION,
    base: E06_CONTROL_BASE,
    controlCount: controls.length,
    modes,
    controls,
    catalogComplete: true,
    readOnly: true,
  };
}
