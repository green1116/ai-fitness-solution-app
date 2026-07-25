/**
 * Product P2 — Department registry
 */

import { DEPARTMENT_STATUSES } from "../organization/organization.constants";
import { getOrganization } from "../organization/organization.registry";
import type {
  Department,
  DepartmentStatus,
  RegisterDepartmentInput,
} from "./department.types";

const departments = new Map<string, Department>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDept(dept: Department): Department {
  return { ...dept, metadata: { ...dept.metadata } };
}

export function registerDepartment(
  input: RegisterDepartmentInput,
): Department {
  const organizationId = input.organizationId.trim();
  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();
  if (!organizationId) throw new Error("department.organizationId is required");
  if (!name) throw new Error("department.name is required");
  if (!code) throw new Error("department.code is required");
  if (!getOrganization(organizationId)) {
    throw new Error(`organization not found: ${organizationId}`);
  }

  const id = input.id?.trim() || createId("p2dept");
  if (departments.has(id)) {
    throw new Error(`department already exists: ${id}`);
  }

  const status = DEPARTMENT_STATUSES[0];
  const dept: Department = {
    id,
    organizationId,
    name,
    code,
    status,
    detail: `code=${code} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  departments.set(id, dept);
  return cloneDept(dept);
}

export function getDepartment(id: string): Department | undefined {
  const dept = departments.get(id.trim());
  return dept ? cloneDept(dept) : undefined;
}

export function listDepartments(filter?: {
  organizationId?: string;
  status?: DepartmentStatus;
}): Department[] {
  let result = [...departments.values()];
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((d) => d.organizationId === oid);
  }
  if (filter?.status) result = result.filter((d) => d.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDept);
}

export function clearDepartments(): void {
  departments.clear();
}
