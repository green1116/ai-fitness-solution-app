import type { ProposalIntelligenceFreezeEvidence } from "../shared/types";
import {
  CANONICAL_PROPOSAL_INTELLIGENCE_QUERY,
  PROPOSAL_INTELLIGENCE_TAG,
  PROPOSAL_INTELLIGENCE_VERSION,
} from "../shared/types";
import { buildProposalIntelligenceCoverageStats } from "./coverage";
import { PROPOSAL_INTELLIGENCE_FROZEN_DOMAINS } from "./constants";
import { buildProposalIntelligenceFreezeReport } from "./report/builders";
import { validateProposalIntelligenceFreeze } from "./validators";

export function buildProposalIntelligenceFreezeEvidence(): ProposalIntelligenceFreezeEvidence {
  const validation = validateProposalIntelligenceFreeze();
  const coverage = buildProposalIntelligenceCoverageStats();
  const report = buildProposalIntelligenceFreezeReport();

  if (!validation.valid) {
    throw new Error("Proposal intelligence freeze evidence incomplete: validation failed");
  }

  return {
    evidenceId: `evidence-proposal-intelligence-freeze-${Date.now()}`,
    version: PROPOSAL_INTELLIGENCE_VERSION,
    tag: PROPOSAL_INTELLIGENCE_TAG,
    freezeManifest: {
      frozenDomains: [...PROPOSAL_INTELLIGENCE_FROZEN_DOMAINS],
      canonicalQuery: CANONICAL_PROPOSAL_INTELLIGENCE_QUERY,
      proposalScore: report.readiness.proposalScore,
      winProbability: report.readiness.winProbability,
      strategyType: report.readiness.strategyType,
    },
    coverage,
    readiness: report.readiness,
    validationPassed: validation.valid,
    generatedAt: new Date().toISOString(),
    summary: `proposal-intelligence-freeze-evidence tag=${PROPOSAL_INTELLIGENCE_TAG} readiness=${report.readiness.readinessScore}% validation=${validation.validationScore}% coverage=${coverage.coverageScore}%`,
  };
}
