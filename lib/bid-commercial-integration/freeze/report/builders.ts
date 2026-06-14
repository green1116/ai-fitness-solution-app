import { buildCommercialProposalPack } from "../../proposal-composer-integration/bridge/proposal-composer-bridge";
import type { CommercialProposalFreezeReport } from "../../shared/types";
import {
  BID_COMMERCIAL_INTEGRATION_TAG,
  BID_COMMERCIAL_INTEGRATION_VERSION,
} from "../../shared/types";
import { buildCommercialCoverageStats } from "../coverage";
import {
  BID_COMMERCIAL_FROZEN_DOMAINS,
  BID_COMMERCIAL_FROZEN_SECTIONS,
  CANONICAL_COMMERCIAL_PROPOSAL_QUERY,
} from "../constants";
import { validateCommercialProposalFreeze } from "../validators";
import { buildCommercialProposalSections } from "../../proposal-sections/builders";
import { buildBidCommercialBundle } from "../../bridge/commercial-bid-bridge";

export function buildCommercialProposalFreezeReport(): CommercialProposalFreezeReport {
  const coverage = buildCommercialCoverageStats();
  const validation = validateCommercialProposalFreeze();
  const examplePack = validation.valid
    ? buildCommercialProposalPack(CANONICAL_COMMERCIAL_PROPOSAL_QUERY)
    : null;

  const bundle = buildBidCommercialBundle(CANONICAL_COMMERCIAL_PROPOSAL_QUERY);
  const sections = buildCommercialProposalSections(bundle);

  const equipmentReadiness =
    sections.find((s) => s.id === "equipment-section")?.readinessScore ?? 0;
  const supplyChainReadiness =
    sections.find((s) => s.id === "supply-chain-section")?.readinessScore ?? 0;
  const procurementReadiness =
    sections.find((s) => s.id === "procurement-section")?.readinessScore ?? 0;
  const deliveryReadiness =
    sections.find((s) => s.id === "delivery-section")?.readinessScore ?? 0;

  const readinessScore = examplePack?.integrationReadiness ?? 0;

  const readiness = {
    readinessScore,
    validationScore: validation.validationScore,
    commercialCoverageScore: coverage.commercialCoverageScore,
    integrationReadiness: examplePack?.integrationReadiness ?? 0,
    equipmentReadiness,
    supplyChainReadiness,
    procurementReadiness,
    deliveryReadiness,
  };

  return {
    version: BID_COMMERCIAL_INTEGRATION_VERSION,
    tag: BID_COMMERCIAL_INTEGRATION_TAG,
    reportId: `commercial-proposal-freeze-report-${Date.now()}`,
    status: "frozen",
    coverage,
    validation,
    readiness,
    examplePack,
    moduleStatistics: {
      frozenDomains: BID_COMMERCIAL_FROZEN_DOMAINS.length,
      proposalSections: BID_COMMERCIAL_FROZEN_SECTIONS.length,
      validationGates: 22,
      reportBuilders: 4,
      bridgeLayers: 3,
    },
    canonicalQuery: CANONICAL_COMMERCIAL_PROPOSAL_QUERY,
    summary: [
      "commercial-proposal-freeze-report",
      `tag=${BID_COMMERCIAL_INTEGRATION_TAG}`,
      `valid=${validation.valid}`,
      `readinessScore=${readinessScore}`,
      `validationScore=${validation.validationScore}`,
      `commercialCoverageScore=${coverage.commercialCoverageScore}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
