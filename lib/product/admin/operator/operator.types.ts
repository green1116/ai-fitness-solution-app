/**
 * Product Admin — Operator types
 */

import type {
  ADMIN_OPERATOR_ROLES,
  ADMIN_OPERATOR_STATUSES,
} from "../foundation/foundation.constants";

export type AdminOperatorRole = (typeof ADMIN_OPERATOR_ROLES)[number];
export type AdminOperatorStatus = (typeof ADMIN_OPERATOR_STATUSES)[number];
export type OperatorMetadata = Record<string, unknown>;

export type AdminOperator = {
  id: string;
  email: string;
  role: AdminOperatorRole;
  status: AdminOperatorStatus;
  tenantId: string;
  detail: string;
  metadata: OperatorMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAdminOperatorInput = {
  id?: string;
  email: string;
  role: AdminOperatorRole;
  tenantId: string;
  metadata?: OperatorMetadata;
};

export type UpdateAdminOperatorStatusInput = {
  operatorId: string;
  status: AdminOperatorStatus;
};
