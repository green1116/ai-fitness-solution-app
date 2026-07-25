/**
 * Product P5 — AI Proposal Generation public exports
 * Isolated namespace: lib/product/p5
 */

export {
  BUILDER_STATUSES,
  GENERATOR_STATUSES,
  P5_MANAGER_STATUSES,
  P5_READINESS_VERDICTS,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION,
  PRODUCT_P5_PROPOSAL_FREEZE_VERSION,
  PROPOSAL_SECTION_KINDS,
  PROPOSAL_STATUSES,
  PROPOSAL_TEMPLATE_KINDS,
} from "./proposal/proposal.constants";

export type {
  AiProposal,
  CreateProposalInput,
  P5ManagerStatus,
  P5ReadinessCheck,
  P5ReadinessResult,
  P5ReadinessVerdict,
  P5RegistryManifest,
  ProposalMetadata,
  ProposalStatus,
  UpdateProposalStatusInput,
} from "./proposal/proposal.types";

export {
  bindProposalTemplate,
  clearProposals,
  createProposal,
  getProposal,
  listProposals,
  updateProposalStatus,
} from "./proposal/proposal.registry";

export type {
  ProposalTemplate,
  ProposalTemplateKind,
  RegisterProposalTemplateInput,
  TemplateMetadata,
} from "./proposal-template/template.types";

export {
  clearProposalTemplates,
  getProposalTemplate,
  listProposalTemplates,
  registerProposalTemplate,
} from "./proposal-template/template.registry";

export type {
  BuilderMetadata,
  BuilderStatus,
  CompleteProposalBuildInput,
  ProposalBuild,
  StartProposalBuildInput,
} from "./proposal-builder/builder.types";

export {
  clearProposalBuilds,
  completeProposalBuild,
  getProposalBuild,
  listProposalBuilds,
  startProposalBuild,
} from "./proposal-builder/builder.registry";

export type {
  GenerateSectionInput,
  GeneratorStatus,
  ProposalSection,
  ProposalSectionKind,
  SectionMetadata,
} from "./section-generator/section.types";

export {
  clearProposalSections,
  generateSection,
  getProposalSection,
  listProposalSections,
} from "./section-generator/section.registry";

export type {
  CreateExecutiveSummaryInput,
  ExecutiveSummary,
  ExecutiveSummaryMetadata,
} from "./executive-summary/summary.types";

export {
  clearExecutiveSummaries,
  createExecutiveSummary,
  getExecutiveSummary,
  listExecutiveSummaries,
} from "./executive-summary/summary.registry";

export type {
  CreateSolutionOverviewInput,
  SolutionOverview,
  SolutionOverviewMetadata,
} from "./solution-overview/overview.types";

export {
  clearSolutionOverviews,
  createSolutionOverview,
  getSolutionOverview,
  listSolutionOverviews,
} from "./solution-overview/overview.registry";

export type {
  CreateDifferentiatorInput,
  Differentiator,
  DifferentiatorMetadata,
} from "./differentiator/differentiator.types";

export {
  clearDifferentiators,
  createDifferentiator,
  getDifferentiator,
  listDifferentiators,
} from "./differentiator/differentiator.registry";

export {
  assertP5AiProposalGenerationReadinessReady,
  evaluateP5AiProposalGenerationReadiness,
} from "./proposal/proposal.readiness";

export {
  clearP5AiProposalGenerationLayer,
  createP5AiProposalManager,
  getP5RegistryManifest,
  type P5AiProposalManager,
  type P5AiProposalManagerSnapshot,
} from "./proposal.manager";

export {
  assertProductP5ReleaseGatePass,
  checkProductP5ReleaseGate,
  PRODUCT_P5_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
