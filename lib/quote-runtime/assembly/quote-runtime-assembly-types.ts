import type { QuoteLifecycleView } from "../lifecycle/quote-lifecycle-types";

export type WorkspaceQuoteRuntimeState = "SHELL" | "READY" | "ACTIVE";

export const WORKSPACE_QUOTE_RUNTIME_STATE_VALUES: WorkspaceQuoteRuntimeState[] = [
  "SHELL",
  "READY",
  "ACTIVE",
];

export interface WorkspaceQuoteRuntimeAssembly {
  workspaceId: string;
  version: string;
  quoteReadiness: QuoteLifecycleView["quoteReadiness"];
  lifecyclePhase: QuoteLifecycleView["lifecyclePhase"];
  lifecycleStatus: QuoteLifecycleView["lifecycleStatus"];
  domainState: QuoteLifecycleView["domainState"];
  runtimeState: WorkspaceQuoteRuntimeState;
}

export type WorkspaceQuoteRuntimeSnapshot = Readonly<WorkspaceQuoteRuntimeAssembly>;

export interface WorkspaceQuoteRuntimeValidation {
  valid: boolean;
  summary: string;
}
