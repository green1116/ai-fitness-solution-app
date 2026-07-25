/**
 * Product P5 — Section generator types
 */

import type {
  GENERATOR_STATUSES,
  PROPOSAL_SECTION_KINDS,
} from "../proposal/proposal.constants";

export type ProposalSectionKind =
  (typeof PROPOSAL_SECTION_KINDS)[number];
export type GeneratorStatus = (typeof GENERATOR_STATUSES)[number];
export type SectionMetadata = Record<string, unknown>;

export type ProposalSection = {
  id: string;
  proposalId: string;
  kind: ProposalSectionKind;
  title: string;
  body: string;
  status: GeneratorStatus;
  detail: string;
  metadata: SectionMetadata;
  generatedAt: string;
};

export type GenerateSectionInput = {
  id?: string;
  proposalId: string;
  kind: ProposalSectionKind;
  title: string;
  body: string;
  metadata?: SectionMetadata;
};
