import type { BusinessScope, BusinessStatus } from "../context/workspace-business-context-types";
import type { BusinessDomainState } from "../domain/workspace-business-domain-types";

export type BusinessOrchestrationState = "IDLE" | "READY" | "LIMITED";

export const BUSINESS_ORCHESTRATION_STATE_VALUES: BusinessOrchestrationState[] = [
  "IDLE",
  "READY",
  "LIMITED",
];

export interface WorkspaceBusinessOrchestration {
  scope: BusinessScope;
  status: BusinessStatus;
  domainState: BusinessDomainState;
  orchestrationState: BusinessOrchestrationState;
}

export interface WorkspaceBusinessOrchestrationValidation {
  valid: boolean;
  summary: string;
}
