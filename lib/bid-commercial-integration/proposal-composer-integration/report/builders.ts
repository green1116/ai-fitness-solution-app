import {
  buildCommercialProposalPack,
  simulateProposalComposer,
  validateTenderResponsePackCompatibility,
} from "../bridge/proposal-composer-bridge";
import type { ProposalIntegrationReadinessReport } from "../shared/types";
import { BID_COMMERCIAL_INTEGRATION_VERSION } from "../../shared/types";
import { buildBidCommercialBundle } from "../../bridge/commercial-bid-bridge";
import { buildCommercialProposalSections } from "../../proposal-sections/builders";
import { validateCommercialProposalPack } from "../validation/validators";

const EXAMPLE_PROPOSAL_PACK_QUERY = {
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym" as const,
};

export function buildProposalIntegrationReadinessReport(): ProposalIntegrationReadinessReport {
  const packValidation = validateCommercialProposalPack(
    buildCommercialProposalPack(EXAMPLE_PROPOSAL_PACK_QUERY),
  );

  const examplePack = packValidation.valid
    ? buildCommercialProposalPack(EXAMPLE_PROPOSAL_PACK_QUERY)
    : null;

  const bundle = buildBidCommercialBundle(EXAMPLE_PROPOSAL_PACK_QUERY);
  const sections = buildCommercialProposalSections(bundle);

  const composerSimulation = examplePack
    ? simulateProposalComposer({ bundle, sections })
    : null;

  const tenderResponseCompatibility = examplePack
    ? validateTenderResponsePackCompatibility(examplePack)
    : null;

  const integrationReadiness = examplePack?.integrationReadiness ?? 0;

  return {
    version: BID_COMMERCIAL_INTEGRATION_VERSION,
    reportId: `proposal-integration-readiness-report-${Date.now()}`,
    packValidation,
    composerSimulation,
    tenderResponseCompatibility,
    examplePack,
    integrationReadiness,
    summary: [
      "proposal-integration-readiness-report",
      `valid=${packValidation.valid}`,
      `integrationReadiness=${integrationReadiness}`,
      composerSimulation
        ? `composerReadiness=${composerSimulation.composerReadiness}`
        : "composer=null",
      tenderResponseCompatibility
        ? `tenderCompatible=${tenderResponseCompatibility.compatible} compatibilityScore=${tenderResponseCompatibility.compatibilityScore}`
        : "tender=null",
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
