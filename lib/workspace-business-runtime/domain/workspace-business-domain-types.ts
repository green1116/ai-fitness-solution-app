import type { BusinessScope, BusinessStatus } from "../context/workspace-business-context-types";

export type BusinessDomainState = "INITIALIZING" | "ACTIVE" | "LIMITED";

export const BUSINESS_DOMAIN_STATE_VALUES: BusinessDomainState[] = [
  "INITIALIZING",
  "ACTIVE",
  "LIMITED",
];

export interface WorkspaceBusinessDomain {
  scope: BusinessScope;
  status: BusinessStatus;
  state: BusinessDomainState;
}

export interface WorkspaceBusinessDomainValidation {
  valid: boolean;
  summary: string;
}
