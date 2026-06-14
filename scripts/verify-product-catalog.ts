/**
 * V36 Product Catalog Foundation — Phase 4 verification
 */
import {
  buildCatalogContext,
  buildCatalogEngineCompatibility,
  buildCatalogRegistryRecords,
  buildConstructionCatalog,
  buildConstructionCategory,
  buildEquipmentCatalog,
  buildEquipmentCategory,
  buildFlooringCatalog,
  buildFlooringCategory,
  buildCatalogProduct,
  buildServiceCatalog,
  buildServiceCategory,
  buildTrackCatalog,
  buildTrackCategory,
  buildTurfCatalog,
  buildTurfCategory,
  CANONICAL_CATALOG_QUERY,
  CANONICAL_PRODUCT_CATALOG_BUYER_ID,
  executeCatalogQuery,
  findActiveCatalogs,
  findCatalogs,
  findMatchedCatalogs,
  findTopCatalogs,
  getAllCatalogProducts,
  getCatalogsByBuyer,
  matchCatalogToProposal,
  PRODUCT_CATALOG_TAG,
  PRODUCT_CATALOG_VERSION,
  TOP_CATALOG_SCORE_THRESHOLD,
  validateProductCatalogFoundation,
} from "../lib/product-catalog";
import {
  REAL_CATALOG_FOUNDATION_VERSION,
  validateRealCatalogFoundation,
} from "../lib/real-catalog-foundation";
import {
  TENDER_PROPOSAL_VERSION,
  validateTenderProposalFoundation,
} from "../lib/tender-proposal";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testCatalogRegistry() {
  const result = validateProductCatalogFoundation().catalogRegistry;
  assert(result.valid, "catalog registry valid");
  assert(result.count >= 12, "catalog registry count");

  const catalogs = buildCatalogRegistryRecords();
  assert(
    catalogs.every((catalog) => catalog.compatibility.realCatalogFoundation.length > 0),
    "real catalog compatibility",
  );

  console.log("✓ catalog registry");
  console.log(" ", result.summary);
}

function testCatalogCategoriesAndProducts() {
  const categoryResult = validateProductCatalogFoundation().catalogCategory;
  const productResult = validateProductCatalogFoundation().catalogProduct;
  assert(categoryResult.valid, "catalog category valid");
  assert(productResult.valid, "catalog product valid");

  const categories = [
    buildEquipmentCategory("gym-equipment"),
    buildFlooringCategory("sports-flooring"),
    buildTrackCategory("running-track"),
    buildTurfCategory("artificial-turf"),
    buildConstructionCategory("sports-hall"),
    buildServiceCategory("fitness-center"),
  ];
  assert(categories.every((category) => category.categoryReady), "categories ready");

  const products = getAllCatalogProducts();
  assert(products.length >= 10, "catalog products");
  const sample = buildCatalogProduct({
    productId: "pc-product-verify",
    sku: "PC-VERIFY-001",
    catalogType: "equipment",
    industrySector: "fitness-center",
    productName: "Verify Catalog Product",
    brandName: "AI Fitness Solution",
    unitPrice: 12000,
    leadTimeDays: 10,
  });
  assert(sample.productReady, "sample product");

  console.log("✓ catalog categories & products");
  console.log(" ", categoryResult.summary);
  console.log(" ", productResult.summary);
}

function testCatalogBuilder() {
  const built = [
    buildEquipmentCatalog(),
    buildFlooringCatalog(),
    buildTrackCatalog(),
    buildTurfCatalog(),
    buildConstructionCatalog(),
    buildServiceCatalog(),
  ];
  assert(built.length === 6, "catalog builder count");
  assert(
    built.every((catalog) => catalog.productIds.length >= 1),
    "catalog builder products",
  );

  console.log("✓ catalog builder");
  console.log(" ", `types=${built.map((catalog) => catalog.catalogType).join(",")}`);
}

function testCatalogMatcher() {
  const result = validateProductCatalogFoundation().catalogMatcher;
  assert(result.valid, "catalog matcher valid");

  const catalog = buildCatalogRegistryRecords()[0]!;
  const match = matchCatalogToProposal(catalog);
  assert(match.matchReady, "catalog match ready");
  assert(match.matchScore >= 50, "catalog match score");

  console.log("✓ catalog matcher");
  console.log(" ", result.summary);
}

function testCatalogQuery() {
  const result = validateProductCatalogFoundation().catalogQuery;
  assert(result.valid, "catalog query valid");

  const canonical = executeCatalogQuery(CANONICAL_CATALOG_QUERY);
  const all = findCatalogs(10);
  const active = findActiveCatalogs(5);
  const matched = findMatchedCatalogs(5);
  const top = findTopCatalogs(5);
  const buyer = getCatalogsByBuyer(CANONICAL_PRODUCT_CATALOG_BUYER_ID);

  assert(canonical.catalogReady, "canonical query ready");
  assert(all.hitCount >= 10, "findCatalogs");
  assert(active.hitCount >= 1, "findActiveCatalogs");
  assert(matched.hitCount >= 1, "findMatchedCatalogs");
  assert(top.hitCount >= 3, "findTopCatalogs");
  assert(buyer.length >= 1, "canonical buyer catalogs");

  const topCatalog = top.catalogs[0]!;
  assert(topCatalog.score.totalCatalogScore >= TOP_CATALOG_SCORE_THRESHOLD, "top threshold");
  assert(
    topCatalog.score.coverageScore > 0 &&
      topCatalog.score.pricingScore > 0 &&
      topCatalog.score.availabilityScore > 0 &&
      topCatalog.score.complianceScore > 0 &&
      topCatalog.score.matchingScore > 0,
    "catalog score dimensions",
  );

  console.log("✓ catalog query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} active=${active.hitCount} matched=${matched.hitCount} top=${top.hitCount} topScore=${topCatalog.score.totalCatalogScore}`,
  );
}

function testEngineCompatibility() {
  const result = validateProductCatalogFoundation().engineCompatibility;
  assert(result.valid, "engine compatibility valid");

  const compatibility = buildCatalogEngineCompatibility();
  assert(
    compatibility.realCatalogFoundation === REAL_CATALOG_FOUNDATION_VERSION,
    "real catalog version",
  );
  assert(compatibility.tenderProposalLayer === TENDER_PROPOSAL_VERSION, "tender proposal version");
  assert(compatibility.marketplaceLayer.length > 0, "marketplace layer");

  const realCatalog = validateRealCatalogFoundation();
  assert(realCatalog.valid, "underlying real catalog unchanged");

  console.log("✓ engine compatibility");
  console.log(" ", result.summary);
}

function testProductCatalogFoundation() {
  const validation = validateProductCatalogFoundation();
  assert(validation.valid, "product catalog foundation validation");
  assert(PRODUCT_CATALOG_VERSION === "v36-product-catalog-1", "product catalog version");
  assert(PRODUCT_CATALOG_TAG === "v36-product-catalog-foundation", "product catalog tag");

  const context = buildCatalogContext();
  assert(context.contextReady, "catalog context ready");
  assert(context.catalogCount >= 12, "catalog context count");

  const tenderProposal = validateTenderProposalFoundation();
  assert(tenderProposal.valid, "underlying tender proposal unchanged");

  console.log("✓ product catalog foundation");
  console.log(" ", validation.catalogRegistry.summary);
  console.log(" ", validation.catalogContext.summary);
  console.log(
    " ",
    `registry=${validation.catalogRegistry.valid} context=${validation.catalogContext.valid} query=${validation.catalogQuery.valid} compat=${validation.engineCompatibility.valid}`,
  );
}

testCatalogRegistry();
testCatalogCategoriesAndProducts();
testCatalogBuilder();
testCatalogMatcher();
testCatalogQuery();
testEngineCompatibility();
testProductCatalogFoundation();
console.log("Product Catalog Foundation PASS");
