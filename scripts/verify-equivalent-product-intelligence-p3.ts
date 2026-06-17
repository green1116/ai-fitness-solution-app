/**
 * V42 Equivalent Product Intelligence — Phase 3 verification
 */
import {
  assessSubstitution,
  buildAllSubstitutionAssessments,
  buildCompatibilityGaps,
  buildCompatibilityMatrix,
  buildSubstitutionCompatibilityEngine,
  buildSubstitutionContext,
  buildSubstitutionReasoning,
  calculateSubstitutionRisk,
  CANONICAL_EQUIVALENT_PRODUCT_ID,
  EPI_P3_TAG,
  EPI_P3_VERSION,
  getEquivalentProductIntelligencePhase3FreezeMeta,
  rankEquivalentProducts,
  validateEquivalentProductIntelligencePhase2,
  validateEquivalentProductIntelligencePhase3,
} from "../lib/equivalent-product-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const phase2 = validateEquivalentProductIntelligencePhase2();
assert(phase2.valid, "phase2 regression");

const validation = validateEquivalentProductIntelligencePhase3();
assert(validation.valid, "phase3 validation");
assert(validation.phase2Valid, "phase2 valid in phase3");
assert(validation.substitution.valid, "substitution validation");
assert(validation.substitution.assessmentCount >= 30, "assessment count");
assert(validation.substitution.compatibleCount >= 10, "compatible count");
assert(validation.substitution.partialCount >= 10, "partial count");
assert(validation.substitution.incompatibleCount >= 5, "incompatible count");
assert(validation.substitution.riskEngineReady, "risk engine ready");
assert(validation.substitution.compatibilityMatrixReady, "compatibility matrix ready");
assert(validation.substitution.gapExplanationReady, "gap explanation ready");
assert(validation.substitution.reasoningReady, "reasoning ready");

const context = buildSubstitutionContext();
assert(context.contextReady, "substitution context ready");
assert(context.equivalentEdgeCount >= 40, "equivalent edges in context");

console.log("✓ substitution context");
console.log(
  `  products=${context.productCount} equivalents=${context.equivalentEdgeCount} tenderReady=${context.tenderContextReady}`,
);

const engine = buildSubstitutionCompatibilityEngine();
assert(engine.contextReady, "substitution engine ready");
assert(engine.assessmentCount >= 30, "engine assessment count");

console.log("✓ substitution compatibility engine");
console.log(`  assessments=${engine.assessmentCount} ready=${engine.contextReady}`);

const ranked = rankEquivalentProducts(CANONICAL_EQUIVALENT_PRODUCT_ID);
const target = ranked[0]!;
const risk = calculateSubstitutionRisk(
  CANONICAL_EQUIVALENT_PRODUCT_ID,
  target.targetProductId,
);
assert(risk.totalRiskScore >= 0 && risk.totalRiskScore <= 100, "risk score range");

const matrix = buildCompatibilityMatrix(
  CANONICAL_EQUIVALENT_PRODUCT_ID,
  target.targetProductId,
);
assert(matrix.totalSpecs >= 0, "compatibility matrix");

const gaps = buildCompatibilityGaps(
  CANONICAL_EQUIVALENT_PRODUCT_ID,
  target.targetProductId,
);
assert(gaps.every((gap) => gap.explanation.length > 0), "gap explanations");

const reasoning = buildSubstitutionReasoning(
  CANONICAL_EQUIVALENT_PRODUCT_ID,
  target.targetProductId,
);
assert(reasoning.whySubstitutable.length > 0, "reasoning substitutable");
assert(reasoning.tenderSuitability.length > 0, "reasoning tender");

const assessment = assessSubstitution(
  CANONICAL_EQUIVALENT_PRODUCT_ID,
  target.targetProductId,
);
assert(assessment.explanation.length > 0, "assessment explanation");
assert(assessment.trace.length > 0, "assessment trace");
assert(typeof assessment.canUseForTender === "boolean", "canUseForTender");

console.log("✓ substitution assessment");
console.log(
  `  risk=${assessment.riskLevel} score=${assessment.riskScore.totalRiskScore} compatibility=${assessment.compatibility.compatibilityLevel} gaps=${assessment.gaps.length}`,
);

const assessments = buildAllSubstitutionAssessments();
const riskLevels = new Map<string, number>();
const compatibilityLevels = new Map<string, number>();
for (const item of assessments) {
  riskLevels.set(item.riskLevel, (riskLevels.get(item.riskLevel) ?? 0) + 1);
  compatibilityLevels.set(
    item.compatibility.compatibilityLevel,
    (compatibilityLevels.get(item.compatibility.compatibilityLevel) ?? 0) + 1,
  );
}

console.log("✓ risk distribution");
console.log(
  `  low=${riskLevels.get("low") ?? 0} medium=${riskLevels.get("medium") ?? 0} high=${riskLevels.get("high") ?? 0} blocked=${riskLevels.get("blocked") ?? 0}`,
);
console.log("✓ compatibility distribution");
console.log(
  `  compatible=${compatibilityLevels.get("compatible") ?? 0} partial=${compatibilityLevels.get("partial") ?? 0} incompatible=${compatibilityLevels.get("incompatible") ?? 0}`,
);
console.log("✓ gap statistics");
console.log(
  `  totalGaps=${assessments.reduce((sum, item) => sum + item.gaps.length, 0)} avgGaps=${(assessments.reduce((sum, item) => sum + item.gaps.length, 0) / assessments.length).toFixed(2)}`,
);

const freeze = getEquivalentProductIntelligencePhase3FreezeMeta();
assert(freeze.valid, "freeze meta valid");
assert(freeze.tag === EPI_P3_TAG, "freeze tag");

console.log("✓ equivalent product intelligence p3");
console.log(`  tag=${freeze.tag}`);
console.log("V42 P3 FREEZE PASS");
