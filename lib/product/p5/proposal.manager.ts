/**
 * Product P5 — AI Proposal Generation Manager
 */

import {
  clearProposalBuilds,
  completeProposalBuild,
  getProposalBuild,
  listProposalBuilds,
  startProposalBuild,
} from "./proposal-builder/builder.registry";
import type {
  CompleteProposalBuildInput,
  ProposalBuild,
  StartProposalBuildInput,
} from "./proposal-builder/builder.types";
import {
  clearProposalTemplates,
  getProposalTemplate,
  listProposalTemplates,
  registerProposalTemplate,
} from "./proposal-template/template.registry";
import type {
  ProposalTemplate,
  RegisterProposalTemplateInput,
} from "./proposal-template/template.types";
import {
  clearDifferentiators,
  createDifferentiator,
  getDifferentiator,
  listDifferentiators,
} from "./differentiator/differentiator.registry";
import type {
  CreateDifferentiatorInput,
  Differentiator,
} from "./differentiator/differentiator.types";
import {
  clearExecutiveSummaries,
  createExecutiveSummary,
  getExecutiveSummary,
  listExecutiveSummaries,
} from "./executive-summary/summary.registry";
import type {
  CreateExecutiveSummaryInput,
  ExecutiveSummary,
} from "./executive-summary/summary.types";
import {
  PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION,
} from "./proposal/proposal.constants";
import {
  assertP5AiProposalGenerationReadinessReady,
  evaluateP5AiProposalGenerationReadiness,
} from "./proposal/proposal.readiness";
import {
  bindProposalTemplate,
  clearProposals,
  createProposal,
  getProposal,
  listProposals,
  updateProposalStatus,
} from "./proposal/proposal.registry";
import type {
  AiProposal,
  CreateProposalInput,
  P5ManagerStatus,
  P5ReadinessResult,
  P5RegistryManifest,
  UpdateProposalStatusInput,
} from "./proposal/proposal.types";
import {
  clearProposalSections,
  generateSection,
  getProposalSection,
  listProposalSections,
} from "./section-generator/section.registry";
import type {
  GenerateSectionInput,
  ProposalSection,
} from "./section-generator/section.types";
import {
  clearSolutionOverviews,
  createSolutionOverview,
  getSolutionOverview,
  listSolutionOverviews,
} from "./solution-overview/overview.registry";
import type {
  CreateSolutionOverviewInput,
  SolutionOverview,
} from "./solution-overview/overview.types";

export type P5AiProposalManagerSnapshot = {
  managerId: string;
  status: P5ManagerStatus;
  layerId: typeof PRODUCT_P5_AI_PROPOSAL_GENERATION_ID;
  version: typeof PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION;
  proposalCount: number;
  templateCount: number;
  sectionCount: number;
  builderCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P5AiProposalManager = {
  initialize: () => P5AiProposalManagerSnapshot;
  start: () => P5AiProposalManagerSnapshot;
  stop: () => P5AiProposalManagerSnapshot;
  status: () => P5AiProposalManagerSnapshot;
  registerTemplate: (input: RegisterProposalTemplateInput) => ProposalTemplate;
  createProposal: (input: CreateProposalInput) => AiProposal;
  bindTemplate: (proposalId: string, templateId: string) => AiProposal;
  updateProposalStatus: (input: UpdateProposalStatusInput) => AiProposal;
  startBuild: (input: StartProposalBuildInput) => ProposalBuild;
  completeBuild: (input: CompleteProposalBuildInput) => ProposalBuild;
  generateSection: (input: GenerateSectionInput) => ProposalSection;
  createExecutiveSummary: (
    input: CreateExecutiveSummaryInput,
  ) => ExecutiveSummary;
  createSolutionOverview: (
    input: CreateSolutionOverviewInput,
  ) => SolutionOverview;
  createDifferentiator: (input: CreateDifferentiatorInput) => Differentiator;
  evaluateReadiness: () => P5ReadinessResult;
  manifest: () => P5RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP5RegistryManifest(): P5RegistryManifest {
  return {
    foundationId: PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
    version: PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION,
    freezeVersion: PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION,
    base: PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE,
    proposalCount: listProposals().length,
    templateCount: listProposalTemplates().length,
    builderCount: listProposalBuilds().length,
    sectionCount: listProposalSections().length,
    executiveSummaryCount: listExecutiveSummaries().length,
    solutionOverviewCount: listSolutionOverviews().length,
    differentiatorCount: listDifferentiators().length,
  };
}

export function clearP5AiProposalGenerationLayer(): void {
  clearDifferentiators();
  clearSolutionOverviews();
  clearExecutiveSummaries();
  clearProposalSections();
  clearProposalBuilds();
  clearProposals();
  clearProposalTemplates();
}

export function createP5AiProposalManager(options?: {
  managerId?: string;
}): P5AiProposalManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p5-prp-mgr");
  let state: P5ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P5AiProposalManagerSnapshot {
    const reg = getP5RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
      version: PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION,
      proposalCount: reg.proposalCount,
      templateCount: reg.templateCount,
      sectionCount: reg.sectionCount,
      builderCount: reg.builderCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P5AiProposalManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP5AiProposalGenerationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P5AiProposalManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P5AiProposalManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerTemplate: (input) => {
      assertRunning("registerTemplate");
      return registerProposalTemplate(input);
    },
    createProposal: (input) => {
      assertRunning("createProposal");
      if (input.templateId?.trim()) {
        const tid = input.templateId.trim();
        if (!getProposalTemplate(tid)) {
          throw new Error(`proposal template not found: ${tid}`);
        }
      }
      return createProposal(input);
    },
    bindTemplate: (proposalId, templateId) => {
      assertRunning("bindTemplate");
      if (!getProposalTemplate(templateId)) {
        throw new Error(`proposal template not found: ${templateId}`);
      }
      return bindProposalTemplate(proposalId, templateId);
    },
    updateProposalStatus: (input) => {
      assertRunning("updateProposalStatus");
      return updateProposalStatus(input);
    },
    startBuild: (input) => {
      assertRunning("startBuild");
      return startProposalBuild(input);
    },
    completeBuild: (input) => {
      assertRunning("completeBuild");
      return completeProposalBuild(input);
    },
    generateSection: (input) => {
      assertRunning("generateSection");
      return generateSection(input);
    },
    createExecutiveSummary: (input) => {
      assertRunning("createExecutiveSummary");
      return createExecutiveSummary(input);
    },
    createSolutionOverview: (input) => {
      assertRunning("createSolutionOverview");
      return createSolutionOverview(input);
    },
    createDifferentiator: (input) => {
      assertRunning("createDifferentiator");
      return createDifferentiator(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP5AiProposalGenerationReadiness();
    },
    manifest: getP5RegistryManifest,
  };
}

export {
  assertP5AiProposalGenerationReadinessReady,
  getDifferentiator,
  getExecutiveSummary,
  getProposal,
  getProposalBuild,
  getProposalSection,
  getProposalTemplate,
  getSolutionOverview,
  listDifferentiators,
  listExecutiveSummaries,
  listProposalBuilds,
  listProposalSections,
  listProposalTemplates,
  listProposals,
  listSolutionOverviews,
};
