import type { WorkspaceQuoteRuntimeSnapshot } from "../assembly/quote-runtime-assembly-types";

export interface QuotePersistencePort {
  loadQuoteSnapshot(workspaceId: string): WorkspaceQuoteRuntimeSnapshot;
  exists(workspaceId: string): boolean;
}
