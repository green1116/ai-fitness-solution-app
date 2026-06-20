import type { QuoteBridgeView, QuoteReadiness } from "../bridge/quote-bridge-view";
import type { QuoteContextDomainState, QuoteContextLifecyclePhase } from "./create-quote-runtime-context";

export interface WorkspaceQuoteRuntimeContext {
  workspaceId: string;
  version: string;
  entryState: QuoteBridgeView["entryState"];
  quoteReadiness: QuoteReadiness;
  lifecyclePhase: QuoteContextLifecyclePhase;
  domainState: QuoteContextDomainState;
  surfaceEligible: boolean;
  surfaceVisible: boolean;
  surfaceActive: boolean;
}
