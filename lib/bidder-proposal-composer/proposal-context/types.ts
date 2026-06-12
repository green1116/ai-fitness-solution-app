import type { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import type { ProposalContext } from "../bridge/context-bridge";

export const PROPOSAL_CONTEXT_RUNTIME_VERSION = "v19.4-proposal-context-1" as const;

export interface ProposalContextRuntimePayload {
  version: typeof PROPOSAL_CONTEXT_RUNTIME_VERSION;
  composerVersion: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  context: ProposalContext;
  contextReadiness: number;
  summary: string;
}
