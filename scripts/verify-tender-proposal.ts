/**
 * V36 Tender Proposal Foundation — Phase 3 verification
 */
import {
  buildCommercialSection,
  buildCommercialTemplate,
  buildComplianceSection,
  buildConstructionSection,
  buildConstructionTemplate,
  buildEquipmentTemplate,
  buildExecutiveSummarySection,
  buildOperationTemplate,
  buildProposalContext,
  buildProposalEngineCompatibility,
  buildProposalRegistryRecords,
  buildTechnicalSection,
  buildTechnicalTemplate,
  CANONICAL_PROPOSAL_QUERY,
  CANONICAL_TENDER_PROPOSAL_BUYER_ID,
  executeProposalQuery,
  findProposals,
  findSubmittedProposals,
  findTopProposals,
  findWinningProposals,
  formatProposalReqsigReference,
  generateCommercialProposal,
  generateConstructionProposal,
  generateEquipmentProposal,
  generateOperationProposal,
  generateTechnicalProposal,
  getProposalsByBuyer,
  TENDER_PROPOSAL_TAG,
  TENDER_PROPOSAL_VERSION,
  TOP_PROPOSAL_SCORE_THRESHOLD,
  validateTenderProposalFoundation,
} from "../lib/tender-proposal";
import { validateTenderHubFoundation } from "../lib/tender-hub";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testProposalRegistry() {
  const result = validateTenderProposalFoundation().proposalRegistry;
  assert(result.valid, "proposal registry valid");
  assert(result.count >= 12, "proposal registry count");

  const proposals = buildProposalRegistryRecords();
  assert(
    proposals.every((proposal) => proposal.compatibility.reqsigVerification === "REQSIG"),
    "REQSIG compatibility",
  );

  console.log("✓ proposal registry");
  console.log(" ", result.summary);
}

function testProposalTemplatesAndSections() {
  const templateResult = validateTenderProposalFoundation().proposalTemplate;
  const sectionResult = validateTenderProposalFoundation().proposalSection;
  assert(templateResult.valid, "proposal template valid");
  assert(sectionResult.valid, "proposal section valid");

  const technical = buildTechnicalTemplate("sports-flooring");
  const commercial = buildCommercialTemplate("fitness-center");
  const construction = buildConstructionTemplate("running-track");
  const equipment = buildEquipmentTemplate("gym-equipment");
  const operation = buildOperationTemplate("sports-hall");

  assert(technical.templateReady, "technical template");
  assert(commercial.templateReady, "commercial template");
  assert(construction.templateReady, "construction template");
  assert(equipment.templateReady, "equipment template");
  assert(operation.templateReady, "operation template");

  const sections = [
    buildExecutiveSummarySection("artificial-turf"),
    buildTechnicalSection("gym-equipment"),
    buildCommercialSection("fitness-center"),
    buildConstructionSection("sports-flooring"),
    buildComplianceSection("sports-hall"),
  ];
  assert(sections.length === 5, "section count");

  console.log("✓ proposal templates & sections");
  console.log(" ", templateResult.summary);
  console.log(" ", sectionResult.summary);
}

function testProposalGenerator() {
  const result = validateTenderProposalFoundation().proposalGenerator;
  assert(result.valid, "proposal generator valid");

  const generated = [
    generateTechnicalProposal(),
    generateCommercialProposal(),
    generateConstructionProposal(),
    generateEquipmentProposal(),
    generateOperationProposal(),
  ];

  assert(generated.length === 5, "generator count");
  assert(
    generated.every((proposal) => proposal.sectionIds.length >= 5),
    "generated section ids",
  );

  console.log("✓ proposal generator");
  console.log(" ", result.summary);
}

function testProposalQuery() {
  const result = validateTenderProposalFoundation().proposalQuery;
  assert(result.valid, "proposal query valid");

  const canonical = executeProposalQuery(CANONICAL_PROPOSAL_QUERY);
  const all = findProposals(10);
  const submitted = findSubmittedProposals(5);
  const winning = findWinningProposals(5);
  const top = findTopProposals(5);
  const buyer = getProposalsByBuyer(CANONICAL_TENDER_PROPOSAL_BUYER_ID);

  assert(canonical.proposalReady, "canonical query ready");
  assert(all.hitCount >= 10, "findProposals");
  assert(submitted.hitCount >= 1, "findSubmittedProposals");
  assert(winning.hitCount >= 1, "findWinningProposals");
  assert(top.hitCount >= 3, "findTopProposals");
  assert(buyer.length >= 1, "canonical buyer proposals");

  const topProposal = top.proposals[0]!;
  assert(topProposal.score.totalProposalScore >= TOP_PROPOSAL_SCORE_THRESHOLD, "top threshold");
  assert(
    topProposal.score.complianceScore > 0 &&
      topProposal.score.technicalScore > 0 &&
      topProposal.score.commercialScore > 0 &&
      topProposal.score.competitionScore > 0 &&
      topProposal.score.winningScore > 0,
    "proposal score dimensions",
  );

  console.log("✓ proposal query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} submitted=${submitted.hitCount} winning=${winning.hitCount} top=${top.hitCount} topScore=${topProposal.score.totalProposalScore}`,
  );
}

function testEngineCompatibility() {
  const result = validateTenderProposalFoundation().engineCompatibility;
  assert(result.valid, "engine compatibility valid");

  const compatibility = buildProposalEngineCompatibility();
  const reqsig = formatProposalReqsigReference("tp-proposal-canonical");
  assert(compatibility.planPdfEngine.length > 0, "plan pdf engine");
  assert(compatibility.budgetPdfEngine.length > 0, "budget pdf engine");
  assert(compatibility.tenderPackageEngine === "v4-tender-pack", "tender package engine");
  assert(/^REQSIG:/i.test(reqsig), "reqsig format");

  console.log("✓ engine compatibility");
  console.log(" ", result.summary);
}

function testTenderProposalFoundation() {
  const validation = validateTenderProposalFoundation();
  assert(validation.valid, "tender proposal foundation validation");
  assert(TENDER_PROPOSAL_VERSION === "v36-tender-proposal-1", "tender proposal version");
  assert(TENDER_PROPOSAL_TAG === "v36-tender-proposal-foundation", "tender proposal tag");

  const context = buildProposalContext();
  assert(context.contextReady, "proposal context ready");
  assert(context.proposalCount >= 12, "proposal context count");

  const tenderHub = validateTenderHubFoundation();
  assert(tenderHub.valid, "underlying tender hub unchanged");

  console.log("✓ tender proposal foundation");
  console.log(" ", validation.proposalRegistry.summary);
  console.log(" ", validation.proposalContext.summary);
  console.log(
    " ",
    `registry=${validation.proposalRegistry.valid} context=${validation.proposalContext.valid} query=${validation.proposalQuery.valid} compat=${validation.engineCompatibility.valid}`,
  );
}

testProposalRegistry();
testProposalTemplatesAndSections();
testProposalGenerator();
testProposalQuery();
testEngineCompatibility();
testTenderProposalFoundation();
console.log("Tender Proposal Foundation PASS");
