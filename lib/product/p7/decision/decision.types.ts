/**
 * Product P7 — Decision types
 */

import type { DECISION_VERDICTS } from "../collaboration/collaboration.constants";

export type DecisionVerdict = (typeof DECISION_VERDICTS)[number];
export type DecisionMetadata = Record<string, unknown>;

export type CollaborationDecision = {
  id: string;
  collaborationId: string;
  verdict: DecisionVerdict;
  decidedBy: string;
  rationale: string;
  conditions: string[];
  detail: string;
  metadata: DecisionMetadata;
  decidedAt: string;
};

export type CreateDecisionInput = {
  id?: string;
  collaborationId: string;
  verdict: DecisionVerdict;
  decidedBy: string;
  rationale: string;
  conditions?: string[];
  metadata?: DecisionMetadata;
};
