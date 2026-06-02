/**
 * V8.3 Sales Enablement Platform — verification
 */
import {
  SALES_ENABLEMENT_VERSION,
  buildSalesDeck,
  buildROICalculator,
  buildCaseStudyCatalog,
  buildProposalTemplateCatalog,
  buildSalesAssetCatalog,
  buildSalesEnablementResponse,
  validateSalesEnablement,
} from "../lib/productization/sales";

const DEPLOYMENT_ID = "v83-sales-enablement-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testSalesDeck() {
  const deck = buildSalesDeck({ deploymentId: DEPLOYMENT_ID });
  assert(deck.version === SALES_ENABLEMENT_VERSION, "deck version");
  assert(deck.deckId.length > 0, "deck id");
  assert(deck.slides.length >= 6, "deck slides");
  assert(deck.productName === "AI Fitness Solution", "deck product name");
  for (const slide of deck.slides) {
    assert(slide.title.length > 0, "slide title");
    assert(slide.bullets.length > 0, "slide bullets");
  }

  console.log("✓ sales deck");
  console.log(" ", deck.summary);
}

function testROICalculator() {
  const calculator = buildROICalculator({
    deploymentId: DEPLOYMENT_ID,
    calculatorInput: {
      employeeCount: 200,
      spaceSizeSqm: 800,
      projectBudget: 500000,
      expectedUtilization: 80,
    },
  });
  assert(calculator.calculatorId.length > 0, "calculator id");
  assert(calculator.input.employeeCount === 200, "employee count");
  assert(calculator.input.spaceSizeSqm === 800, "space size");
  assert(calculator.input.projectBudget === 500000, "project budget");
  assert(calculator.input.expectedUtilization === 80, "expected utilization");
  assert(calculator.estimatedRoi >= 0, "estimated roi");
  assert(calculator.productivityImpact > 0, "productivity impact");
  assert(calculator.wellnessImpact > 0, "wellness impact");
  assert(calculator.investmentSummary.length > 0, "investment summary");

  console.log("✓ roi calculator");
  console.log(" ", calculator.summary);
}

function testCaseStudies() {
  const catalog = buildCaseStudyCatalog({ deploymentId: DEPLOYMENT_ID });
  assert(catalog.version === SALES_ENABLEMENT_VERSION, "case study version");
  assert(catalog.caseStudies.length === 3, "case study count");

  const segments = catalog.caseStudies.map((c) => c.segment);
  assert(segments.includes("small-office"), "small office case");
  assert(segments.includes("medium-enterprise"), "medium enterprise case");
  assert(segments.includes("large-enterprise"), "large enterprise case");

  for (const study of catalog.caseStudies) {
    assert(study.problem.length > 0, "case problem");
    assert(study.solution.length > 0, "case solution");
    assert(study.budget.length > 0, "case budget");
    assert(study.outcome.length > 0, "case outcome");
    assert(study.roi > 0, "case roi");
  }

  console.log("✓ case study library");
  console.log(" ", catalog.summary);
}

function testProposalTemplates() {
  const catalog = buildProposalTemplateCatalog({ deploymentId: DEPLOYMENT_ID });
  assert(catalog.version === SALES_ENABLEMENT_VERSION, "proposal version");
  assert(catalog.templates.length === 3, "proposal template count");

  const tiers = catalog.templates.map((t) => t.tier);
  assert(tiers.includes("starter"), "starter template");
  assert(tiers.includes("professional"), "professional template");
  assert(tiers.includes("enterprise"), "enterprise template");

  for (const template of catalog.templates) {
    assert(template.recommendedPackage === template.tier, "recommended package");
    assert(template.commercialSummary.length > 0, "commercial summary");
    assert(template.sections.length >= 5, "template sections");
  }

  console.log("✓ proposal template library");
  console.log(" ", catalog.summary);
}

function testSalesAssetCatalog() {
  const assets = buildSalesAssetCatalog({ deploymentId: DEPLOYMENT_ID });
  assert(assets.version === SALES_ENABLEMENT_VERSION, "asset catalog version");
  assert(assets.totalAssets > 0, "total assets");
  assert(assets.demoEnvironment.ready, "demo environment ready");

  const response = buildSalesEnablementResponse({ deploymentId: DEPLOYMENT_ID });
  assert(response.salesAssets.catalogId === assets.catalogId, "response assets");
  assert(response.salesDeck.slides.length >= 6, "response deck");
  assert(response.roiCalculator.estimatedRoi >= 0, "response roi");
  assert(response.caseStudies.length === 3, "response case studies");
  assert(response.proposalTemplates.length === 3, "response templates");

  const validation = validateSalesEnablement({ deploymentId: DEPLOYMENT_ID });
  assert(validation.salesDeckExists, "sales deck exists");
  assert(validation.roiCalculatorExists, "roi calculator exists");
  assert(validation.caseStudiesExist, "case studies exist");
  assert(validation.proposalTemplatesExist, "proposal templates exist");
  assert(validation.assetCatalogValid, "asset catalog valid");

  console.log("✓ sales asset catalog");
  console.log(" ", assets.summary);
  console.log("");
  console.log("SALES ENABLEMENT VERIFY PASS");
}

function main() {
  testSalesDeck();
  testROICalculator();
  testCaseStudies();
  testProposalTemplates();
  testSalesAssetCatalog();
}

main();
