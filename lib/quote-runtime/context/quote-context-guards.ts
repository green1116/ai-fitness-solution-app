import {
  QUOTE_CONTEXT_DOMAIN_STATE_VALUES,
  QUOTE_CONTEXT_LIFECYCLE_PHASE_VALUES,
  resolveContextDomainState,
  resolveContextLifecyclePhase,
} from "./create-quote-runtime-context";
import type { QuoteReadiness } from "../bridge/quote-bridge-view";
import type { WorkspaceQuoteRuntimeContext } from "./workspace-quote-runtime-context-types";

export interface QuoteRuntimeContextValidation {
  valid: boolean;
  summary: string;
}

const QUOTE_READINESS_VALUES: QuoteReadiness[] = ["READY", "PARTIAL", "BLOCKED"];

export function validateQuoteRuntimeContext(context: WorkspaceQuoteRuntimeContext): QuoteRuntimeContextValidation {
  const valid =
    context.workspaceId.trim().length > 0 &&
    context.version.trim().length > 0 &&
    QUOTE_READINESS_VALUES.includes(context.quoteReadiness) &&
    QUOTE_CONTEXT_LIFECYCLE_PHASE_VALUES.includes(context.lifecyclePhase) &&
    QUOTE_CONTEXT_DOMAIN_STATE_VALUES.includes(context.domainState) &&
    context.lifecyclePhase === resolveContextLifecyclePhase(context.quoteReadiness) &&
    context.domainState === resolveContextDomainState(context.quoteReadiness);

  return {
    valid,
    summary: [
      `workspaceId=${context.workspaceId}`,
      `quoteReadiness=${context.quoteReadiness}`,
      `lifecyclePhase=${context.lifecyclePhase}`,
      `domainState=${context.domainState}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertWorkspaceQuoteRuntimeContextShape(context: WorkspaceQuoteRuntimeContext): boolean {
  return validateQuoteRuntimeContext(context).valid;
}
