import type {
  WorkspaceBusinessBridgeView,
  WorkspaceBusinessEntry,
} from "@/lib/workspace-business-runtime";
import { createQuoteBridgeFromBusinessViews } from "../bridge/create-quote-bridge";
import { createWorkspaceQuoteRuntimeContext } from "../context/quote-context-factory";
import type { WorkspaceQuoteRuntimeContext } from "../context/workspace-quote-runtime-context-types";
import { WORKSPACE_QUOTE_RUNTIME_VERSION } from "../shared/quote-constants";
import type { QuoteContextDomainState } from "../context/create-quote-runtime-context";
import type { QuoteContextLifecyclePhase } from "../context/create-quote-runtime-context";

export interface WorkspaceQuoteRuntime {
  version: string;
  context: WorkspaceQuoteRuntimeContext;
  lifecyclePhase: QuoteContextLifecyclePhase;
  domainState: QuoteContextDomainState;
}

export interface CreateWorkspaceQuoteRuntimeInput {
  entry: WorkspaceBusinessEntry;
  bridgeView: WorkspaceBusinessBridgeView;
}

export function createWorkspaceQuoteRuntime(
  input: CreateWorkspaceQuoteRuntimeInput,
): WorkspaceQuoteRuntime {
  const bridgeView = createQuoteBridgeFromBusinessViews(input.entry, input.bridgeView);
  const context = createWorkspaceQuoteRuntimeContext(bridgeView);
  return {
    version: WORKSPACE_QUOTE_RUNTIME_VERSION,
    context,
    lifecyclePhase: context.lifecyclePhase,
    domainState: context.domainState,
  };
}

export function describeWorkspaceQuoteRuntime(runtime: WorkspaceQuoteRuntime): string {
  return [
    `version=${runtime.version}`,
    `workspaceId=${runtime.context.workspaceId}`,
    `quoteReadiness=${runtime.context.quoteReadiness}`,
    `lifecyclePhase=${runtime.lifecyclePhase}`,
    `domainState=${runtime.domainState}`,
  ].join(" ");
}

export function assertWorkspaceQuoteRuntimeShape(runtime: WorkspaceQuoteRuntime): boolean {
  return (
    runtime.version.trim().length > 0 &&
    runtime.context.workspaceId.trim().length > 0 &&
    runtime.lifecyclePhase === runtime.context.lifecyclePhase &&
    runtime.domainState === runtime.context.domainState
  );
}
