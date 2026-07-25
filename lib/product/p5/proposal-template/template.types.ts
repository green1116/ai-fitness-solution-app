/**
 * Product P5 — Proposal template types
 */

import type { PROPOSAL_TEMPLATE_KINDS } from "../proposal/proposal.constants";

export type ProposalTemplateKind =
  (typeof PROPOSAL_TEMPLATE_KINDS)[number];
export type TemplateMetadata = Record<string, unknown>;

export type ProposalTemplate = {
  id: string;
  kind: ProposalTemplateKind;
  name: string;
  description: string;
  defaultSections: string[];
  detail: string;
  metadata: TemplateMetadata;
  createdAt: string;
};

export type RegisterProposalTemplateInput = {
  id?: string;
  kind: ProposalTemplateKind;
  name: string;
  description?: string;
  defaultSections?: string[];
  metadata?: TemplateMetadata;
};
