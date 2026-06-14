import type { CommercialProposalFreezeEvidence } from "../shared/types";
import {
  BID_COMMERCIAL_INTEGRATION_TAG,
  BID_COMMERCIAL_INTEGRATION_VERSION,
} from "../shared/types";
import { buildCommercialCoverageStats } from "./coverage";
import { BID_COMMERCIAL_FROZEN_DOMAINS, CANONICAL_COMMERCIAL_PROPOSAL_QUERY } from "./constants";
import { buildCommercialProposalFreezeReport } from "./report/builders";
import { validateCommercialProposalFreeze } from "./validators";
import { buildCommercialProposalPack } from "../proposal-composer-integration/bridge/proposal-composer-bridge";

export function buildCommercialProposalFreezeEvidence(): CommercialProposalFreezeEvidence {
  const validation = validateCommercialProposalFreeze();
  const coverage = buildCommercialCoverageStats();
  const report = buildCommercialProposalFreezeReport();

  if (!validation.valid) {
    throw new Error("Commercial proposal freeze evidence incomplete: validation failed");
  }

  const pack = buildCommercialProposalPack(CANONICAL_COMMERCIAL_PROPOSAL_QUERY);

  return {
    evidenceId: `evidence-commercial-proposal-freeze-${Date.now()}`,
    version: BID_COMMERCIAL_INTEGRATION_VERSION,
    tag: BID_COMMERCIAL_INTEGRATION_TAG,
    freezeManifest: {
      packId: pack.packId,
      bundleId: pack.bundleId,
      frozenDomains: [...BID_COMMERCIAL_FROZEN_DOMAINS],
      canonicalQuery: CANONICAL_COMMERCIAL_PROPOSAL_QUERY,
    },
    coverage,
    readiness: report.readiness,
    validationPassed: validation.valid,
    generatedAt: new Date().toISOString(),
    summary: `commercial-proposal-freeze-evidence tag=${BID_COMMERCIAL_INTEGRATION_TAG} readiness=${report.readiness.readinessScore}% validation=${validation.validationScore}% coverage=${coverage.commercialCoverageScore}%`,
  };
}
