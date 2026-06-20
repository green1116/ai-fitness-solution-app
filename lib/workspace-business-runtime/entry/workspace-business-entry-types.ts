import type { BusinessScope, BusinessStatus } from "../context/workspace-business-context-types";
import type { BusinessDomainState } from "../domain/workspace-business-domain-types";
import type { BusinessOrchestrationState } from "../orchestration/workspace-business-orchestration-types";

export type BusinessEntryState = "DRAFT" | "ACTIVE" | "DISABLED";

export const BUSINESS_ENTRY_STATE_VALUES: BusinessEntryState[] = ["DRAFT", "ACTIVE", "DISABLED"];

export interface WorkspaceBusinessEntry {
  scope: BusinessScope;
  status: BusinessStatus;
  domainState: BusinessDomainState;
  orchestrationState: BusinessOrchestrationState;
  entryState: BusinessEntryState;
}

export interface WorkspaceBusinessEntryRegistry {
  workspaceId: string;
  entry: WorkspaceBusinessEntry;
}

export interface WorkspaceBusinessEntryValidation {
  valid: boolean;
  summary: string;
}
