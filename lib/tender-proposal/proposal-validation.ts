import { TENDER_DOC_VERSION } from "@/lib/pdf/tenderDocumentContext";
import { validateTenderHubFoundation } from "@/lib/tender-hub";
import { buildProposalContext, validateProposalContext } from "./proposal-context";
import {
  buildProposalEngineCompatibility,
  formatProposalReqsigReference,
  TENDER_PACKAGE_ENGINE_LABEL,
} from "./proposal-engine-compat";
import {
  generateCommercialProposal,
  generateConstructionProposal,
  generateEquipmentProposal,
  generateOperationProposal,
  generateTechnicalProposal,
} from "./proposal-generator";
import { validateProposalQueryRegistry } from "./proposal-query";
import { validateProposalRegistry } from "./proposal-registry";
import { buildProposalScore } from "./proposal-scoring";
import {
  buildCommercialSection,
  buildComplianceSection,
  buildConstructionSection,
  buildExecutiveSummarySection,
  buildTechnicalSection,
} from "./proposal-section";
import {
  buildCommercialTemplate,
  buildConstructionTemplate,
  buildEquipmentTemplate,
  buildOperationTemplate,
  buildTechnicalTemplate,
  getAllProposalTemplates,
} from "./proposal-template";
import type { RegistryValidation, TenderProposalValidation } from "./shared/types";
import { REQSIG_VERIFICATION_LABEL } from "./proposal-engine-compat";

function validateProposalTemplateRegistry(): RegistryValidation {
  const templates = [
    buildTechnicalTemplate(),
    buildCommercialTemplate(),
    buildConstructionTemplate(),
    buildEquipmentTemplate(),
    buildOperationTemplate(),
  ];
  const allTemplates = getAllProposalTemplates();
  const valid =
    templates.every((template) => template.templateReady) &&
    allTemplates.length >= 30 &&
    templates.length === 5;

  return {
    valid,
    count: templates.length,
    summary: `proposal-template count=${templates.length} allTemplates=${allTemplates.length} valid=${valid}`,
  };
}

function validateProposalSectionRegistry(): RegistryValidation {
  const sections = [
    buildExecutiveSummarySection(),
    buildTechnicalSection(),
    buildCommercialSection(),
    buildConstructionSection(),
    buildComplianceSection(),
  ];
  const valid = sections.every((section) => section.sectionId.length > 0 && section.content.length > 0);

  return {
    valid,
    count: sections.length,
    summary: `proposal-section count=${sections.length} valid=${valid}`,
  };
}

function validateProposalGeneratorRegistry(): RegistryValidation {
  const generated = [
    generateTechnicalProposal(),
    generateCommercialProposal(),
    generateConstructionProposal(),
    generateEquipmentProposal(),
    generateOperationProposal(),
  ];
  const valid =
    generated.length === 5 &&
    generated.every((proposal) => proposal.proposalId.length > 0 && proposal.templateId.length > 0);

  return {
    valid,
    count: generated.length,
    summary: `proposal-generator count=${generated.length} valid=${valid}`,
  };
}

function validateProposalScoringRegistry(): RegistryValidation {
  const score = buildProposalScore("tp-proposal-test", {
    complianceScore: 82,
    technicalScore: 88,
    commercialScore: 79,
    competitionScore: 71,
    winningScore: 85,
  });
  const valid =
    score.complianceScore > 0 &&
    score.technicalScore > 0 &&
    score.commercialScore > 0 &&
    score.competitionScore > 0 &&
    score.winningScore > 0 &&
    score.totalProposalScore > 0;

  return {
    valid,
    count: 1,
    summary: `proposal-scoring total=${score.totalProposalScore} valid=${valid}`,
  };
}

function validateEngineCompatibility(): RegistryValidation {
  const compatibility = buildProposalEngineCompatibility();
  const reqsig = formatProposalReqsigReference("tp-proposal-test");
  const valid =
    compatibility.planPdfEngine === TENDER_DOC_VERSION &&
    compatibility.budgetPdfEngine === TENDER_DOC_VERSION &&
    compatibility.tenderPackageEngine === TENDER_PACKAGE_ENGINE_LABEL &&
    compatibility.reqsigVerification === REQSIG_VERIFICATION_LABEL &&
    /^REQSIG:/i.test(reqsig);

  return {
    valid,
    count: 1,
    summary: `engine-compatibility plan=${compatibility.planPdfEngine} pack=${compatibility.tenderPackageEngine} valid=${valid}`,
  };
}

export function validateTenderProposalFoundation(): TenderProposalValidation {
  const proposalRegistry = validateProposalRegistry();
  const proposalContext = validateProposalContext();
  const proposalTemplate = validateProposalTemplateRegistry();
  const proposalSection = validateProposalSectionRegistry();
  const proposalGenerator = validateProposalGeneratorRegistry();
  const proposalScoring = validateProposalScoringRegistry();
  const proposalQuery = validateProposalQueryRegistry();
  const engineCompatibility = validateEngineCompatibility();

  const tenderHub = validateTenderHubFoundation();

  return {
    valid:
      proposalRegistry.valid &&
      proposalContext.valid &&
      proposalTemplate.valid &&
      proposalSection.valid &&
      proposalGenerator.valid &&
      proposalScoring.valid &&
      proposalQuery.valid &&
      engineCompatibility.valid &&
      tenderHub.valid,
    proposalRegistry,
    proposalContext,
    proposalTemplate,
    proposalSection,
    proposalGenerator,
    proposalScoring,
    proposalQuery,
    engineCompatibility,
  };
}

export function buildTenderProposalFoundationSnapshot() {
  return {
    context: buildProposalContext(),
    validation: validateTenderProposalFoundation(),
  };
}
