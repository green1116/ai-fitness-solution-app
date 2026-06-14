/**
 * V30 Industry Platform Foundation — Phase 4 Classification Foundation verification
 */
import {
  buildCategoryTree,
  buildIndustryClassificationContext,
  CANONICAL_CATEGORY_ID,
  CANONICAL_INDUSTRY_CLASSIFICATION_QUERY,
  INDUSTRY_CLASSIFICATION_TAG,
  INDUSTRY_CLASSIFICATION_VERSION,
  queryAssignmentsByTarget,
  queryCategoriesByParent,
  queryClassification,
  validateCategoryAssignmentRegistry,
  validateCategoryRegistry,
  validateClassificationContextRegistry,
  validateClassificationQueryRegistry,
  validateIndustryClassification,
  validateIndustryClassificationContext,
} from "../lib/industry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testCategoryRegistry() {
  const result = validateCategoryRegistry();
  assert(result.valid, "category registry valid");
  assert(result.count >= 14, "category count");
  console.log("✓ category registry");
  console.log(" ", result.summary);
}

function testCategoryAssignment() {
  const result = validateCategoryAssignmentRegistry();
  assert(result.valid, "category assignment valid");
  assert(result.count >= 14, "assignment count");
  console.log("✓ category assignment");
  console.log(" ", result.summary);
}

function testClassificationContext() {
  const result = validateClassificationContextRegistry();
  assert(result.valid, "classification context registry valid");

  const context = buildIndustryClassificationContext();
  assert(validateIndustryClassificationContext(context), "classification context valid");

  const tree = buildCategoryTree();
  assert(tree.length >= 3, "category tree roots");
  assert(
    tree.some((root) => root.category.categoryId === "ind-cat-fitness-equipment"),
    "equipment root in tree",
  );

  console.log("✓ classification context");
  console.log(" ", result.summary);
  console.log(
    " ",
    `treeRoots=${tree.length} categories=${context.totalCategories} assignments=${context.totalAssignments}`,
  );
}

function testClassificationQuery() {
  const result = validateClassificationQueryRegistry();
  assert(result.valid, "classification query registry valid");

  const canonical = queryClassification(CANONICAL_INDUSTRY_CLASSIFICATION_QUERY);
  assert(canonical.classificationReady, "canonical query ready");
  assert(canonical.categories.some((c) => c.categoryId === CANONICAL_CATEGORY_ID), "canonical category");

  const equipmentChildren = queryCategoriesByParent("ind-cat-fitness-equipment");
  const lfAssignments = queryAssignmentsByTarget("directory-entry", "ind-dir-brand-life-fitness");

  assert(equipmentChildren.hitCount >= 3, "equipment children query");
  assert(lfAssignments.assignments.length >= 2, "lf directory assignments");

  console.log("✓ classification query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.categories.length} equipmentChildren=${equipmentChildren.hitCount} lfAssignments=${lfAssignments.assignments.length}`,
  );
}

function testIndustryClassification() {
  const validation = validateIndustryClassification();
  assert(validation.valid, "industry classification validation");
  assert(INDUSTRY_CLASSIFICATION_VERSION === "v30-industry-platform-4", "classification version");
  assert(
    INDUSTRY_CLASSIFICATION_TAG === "v30-industry-classification-foundation",
    "classification tag",
  );

  console.log("✓ industry classification validation");
  console.log(
    " ",
    `category=${validation.categoryRegistry.valid} assignment=${validation.categoryAssignment.valid} context=${validation.classificationContext.valid} query=${validation.classificationQuery.valid}`,
  );
}

testCategoryRegistry();
testCategoryAssignment();
testClassificationContext();
testClassificationQuery();
testIndustryClassification();
console.log("Industry Classification Foundation PASS");
