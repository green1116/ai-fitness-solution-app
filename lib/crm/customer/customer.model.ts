/**
 * V60 P2 — Customer domain model
 */

import type { CustomerStatus, CustomerRow } from "../types";

export type CustomerRecord = CustomerRow;

export const CUSTOMER_STATUSES: CustomerStatus[] = ["ACTIVE", "INACTIVE"];

export type CustomerLifecycleStage =
  | "prospect"
  | "onboarding"
  | "active"
  | "expansion"
  | "churn_risk"
  | "churned";

export function normalizeCustomerStatus(status: string): CustomerStatus {
  const upper = status.toUpperCase();
  return upper === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

export function mapStatusToLifecycle(status: CustomerStatus): CustomerLifecycleStage {
  return status === "ACTIVE" ? "active" : "churned";
}

export function isActiveCustomer(customer: Pick<CustomerRecord, "status">): boolean {
  return normalizeCustomerStatus(customer.status) === "ACTIVE";
}
