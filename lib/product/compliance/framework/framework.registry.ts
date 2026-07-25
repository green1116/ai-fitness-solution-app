/**
 * Product Compliance — Framework registry
 */

import {
  COMPLIANCE_FRAMEWORK_KINDS,
  COMPLIANCE_FRAMEWORK_STATUSES,
} from "../governance/governance.constants";
import type {
  ComplianceFramework,
  ComplianceFrameworkKind,
  ComplianceFrameworkStatus,
  RegisterComplianceFrameworkInput,
  UpdateComplianceFrameworkStatusInput,
} from "./framework.types";

const frameworks = new Map<string, ComplianceFramework>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneFramework(framework: ComplianceFramework): ComplianceFramework {
  return { ...framework, metadata: { ...framework.metadata } };
}

export function registerComplianceFramework(
  input: RegisterComplianceFrameworkInput,
): ComplianceFramework {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  const opsSurfaceId = input.opsSurfaceId.trim();
  if (!code) throw new Error("framework.code is required");
  if (!name) throw new Error("framework.name is required");
  if (!opsSurfaceId) throw new Error("framework.opsSurfaceId is required");
  if (!(COMPLIANCE_FRAMEWORK_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid framework kind: ${input.kind}`);
  }

  const duplicate = [...frameworks.values()].find((f) => f.code === code);
  if (duplicate) throw new Error(`framework code already exists: ${code}`);

  const id = input.id?.trim() || createId("cmpfw");
  if (frameworks.has(id)) throw new Error(`framework already exists: ${id}`);

  const now = nowIso();
  const framework: ComplianceFramework = {
    id,
    code,
    name,
    kind: input.kind,
    opsSurfaceId,
    status: COMPLIANCE_FRAMEWORK_STATUSES[0],
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  frameworks.set(id, framework);
  return cloneFramework(framework);
}

export function updateComplianceFrameworkStatus(
  input: UpdateComplianceFrameworkStatusInput,
): ComplianceFramework {
  const frameworkId = input.frameworkId.trim();
  if (!frameworkId) throw new Error("framework.frameworkId is required");
  if (
    !(COMPLIANCE_FRAMEWORK_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid framework status: ${input.status}`);
  }

  const existing = frameworks.get(frameworkId);
  if (!existing) throw new Error(`framework not found: ${frameworkId}`);

  const updated: ComplianceFramework = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  frameworks.set(frameworkId, updated);
  return cloneFramework(updated);
}

export function getComplianceFramework(
  id: string,
): ComplianceFramework | undefined {
  const framework = frameworks.get(id.trim());
  return framework ? cloneFramework(framework) : undefined;
}

export function listComplianceFrameworks(filter?: {
  kind?: ComplianceFrameworkKind;
  status?: ComplianceFrameworkStatus;
}): ComplianceFramework[] {
  let result = [...frameworks.values()];
  if (filter?.kind) result = result.filter((f) => f.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((f) => f.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneFramework);
}

export function clearComplianceFrameworks(): void {
  frameworks.clear();
}
