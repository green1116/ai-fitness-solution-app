/**
 * Product Compliance — Control registry
 */

import { COMPLIANCE_CONTROL_STATUSES } from "../governance/governance.constants";
import { getComplianceFramework } from "../framework/framework.registry";
import type {
  ComplianceControl,
  ComplianceControlStatus,
  DefineComplianceControlInput,
  UpdateComplianceControlStatusInput,
} from "./control.types";

const controls = new Map<string, ComplianceControl>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneControl(control: ComplianceControl): ComplianceControl {
  return { ...control, metadata: { ...control.metadata } };
}

export function defineComplianceControl(
  input: DefineComplianceControlInput,
): ComplianceControl {
  const frameworkId = input.frameworkId.trim();
  const code = input.code.trim().toUpperCase();
  const title = input.title.trim();
  if (!frameworkId) throw new Error("control.frameworkId is required");
  if (!code) throw new Error("control.code is required");
  if (!title) throw new Error("control.title is required");

  const framework = getComplianceFramework(frameworkId);
  if (!framework) throw new Error(`framework not found: ${frameworkId}`);
  if (framework.status !== "ACTIVE") {
    throw new Error(`framework not active: ${frameworkId}`);
  }

  const duplicate = [...controls.values()].find(
    (c) => c.frameworkId === frameworkId && c.code === code,
  );
  if (duplicate) throw new Error(`control code already exists: ${code}`);

  const id = input.id?.trim() || createId("cmpctl");
  if (controls.has(id)) throw new Error(`control already exists: ${id}`);

  const now = nowIso();
  const control: ComplianceControl = {
    id,
    frameworkId,
    code,
    title,
    status: COMPLIANCE_CONTROL_STATUSES[0],
    detail: `status=DEFINED`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  controls.set(id, control);
  return cloneControl(control);
}

export function updateComplianceControlStatus(
  input: UpdateComplianceControlStatusInput,
): ComplianceControl {
  const controlId = input.controlId.trim();
  if (!controlId) throw new Error("control.controlId is required");
  if (
    !(COMPLIANCE_CONTROL_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid control status: ${input.status}`);
  }

  const existing = controls.get(controlId);
  if (!existing) throw new Error(`control not found: ${controlId}`);

  const updated: ComplianceControl = {
    ...existing,
    status: input.status,
    detail: `status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  controls.set(controlId, updated);
  return cloneControl(updated);
}

export function getComplianceControl(
  id: string,
): ComplianceControl | undefined {
  const control = controls.get(id.trim());
  return control ? cloneControl(control) : undefined;
}

export function listComplianceControls(filter?: {
  frameworkId?: string;
  status?: ComplianceControlStatus;
}): ComplianceControl[] {
  let result = [...controls.values()];
  if (filter?.frameworkId) {
    const frameworkId = filter.frameworkId.trim();
    result = result.filter((c) => c.frameworkId === frameworkId);
  }
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneControl);
}

export function clearComplianceControls(): void {
  controls.clear();
}
