/**
 * Product Admin — Operator registry
 */

import {
  ADMIN_OPERATOR_ROLES,
  ADMIN_OPERATOR_STATUSES,
} from "../foundation/foundation.constants";
import { getAdminTenant } from "../tenant/tenant.registry";
import type {
  AdminOperator,
  AdminOperatorRole,
  AdminOperatorStatus,
  RegisterAdminOperatorInput,
  UpdateAdminOperatorStatusInput,
} from "./operator.types";

const operators = new Map<string, AdminOperator>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOperator(operator: AdminOperator): AdminOperator {
  return { ...operator, metadata: { ...operator.metadata } };
}

export function registerAdminOperator(
  input: RegisterAdminOperatorInput,
): AdminOperator {
  const email = input.email.trim().toLowerCase();
  const tenantId = input.tenantId.trim();
  if (!email) throw new Error("operator.email is required");
  if (!tenantId) throw new Error("operator.tenantId is required");
  if (!(ADMIN_OPERATOR_ROLES as readonly string[]).includes(input.role)) {
    throw new Error(`invalid operator role: ${input.role}`);
  }
  if (!getAdminTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }

  const duplicate = [...operators.values()].find((o) => o.email === email);
  if (duplicate) throw new Error(`operator email already exists: ${email}`);

  const id = input.id?.trim() || createId("admop");
  if (operators.has(id)) throw new Error(`operator already exists: ${id}`);

  const now = nowIso();
  const operator: AdminOperator = {
    id,
    email,
    role: input.role,
    status: ADMIN_OPERATOR_STATUSES[0],
    tenantId,
    detail: `role=${input.role} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  operators.set(id, operator);
  return cloneOperator(operator);
}

export function updateAdminOperatorStatus(
  input: UpdateAdminOperatorStatusInput,
): AdminOperator {
  const operatorId = input.operatorId.trim();
  if (!operatorId) throw new Error("operator.operatorId is required");
  if (
    !(ADMIN_OPERATOR_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid operator status: ${input.status}`);
  }

  const existing = operators.get(operatorId);
  if (!existing) throw new Error(`operator not found: ${operatorId}`);

  const updated: AdminOperator = {
    ...existing,
    status: input.status,
    detail: `role=${existing.role} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  operators.set(operatorId, updated);
  return cloneOperator(updated);
}

export function getAdminOperator(id: string): AdminOperator | undefined {
  const operator = operators.get(id.trim());
  return operator ? cloneOperator(operator) : undefined;
}

export function listAdminOperators(filter?: {
  role?: AdminOperatorRole;
  status?: AdminOperatorStatus;
  tenantId?: string;
}): AdminOperator[] {
  let result = [...operators.values()];
  if (filter?.role) result = result.filter((o) => o.role === filter.role);
  if (filter?.status) {
    result = result.filter((o) => o.status === filter.status);
  }
  if (filter?.tenantId) {
    const tenantId = filter.tenantId.trim();
    result = result.filter((o) => o.tenantId === tenantId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOperator);
}

export function clearAdminOperators(): void {
  operators.clear();
}
