/**
 * EPI v1 Freeze — Product Intelligence WP1~WP5 evidence verification
 */
import {
  buildApplicationReleaseFeedback,
  clearApplicationReleaseFeedback,
} from "../lib/release/application/feedback";
import {
  buildApplicationReleaseCandidate,
  clearApplicationReleaseCandidate,
} from "../lib/release/application/candidate";
import {
  buildApplicationReleaseChange,
  clearApplicationReleaseChange,
} from "../lib/release/application/change";
import {
  buildApplicationDeploymentEvidence,
  clearApplicationDeploymentEvidence,
} from "../lib/release/application/deployment";
import {
  buildApplicationProductionRelease,
  clearApplicationProductionRelease,
} from "../lib/release/application/production-release";
import {
  buildApplicationReleaseVerification,
  clearApplicationReleaseVerification,
} from "../lib/release/application/verification";
import {
  buildAdoptionHealth,
  clearAdoptionHealth,
} from "../lib/release/customer/adoption-health";
import {
  buildCustomerActivityEvidence,
  clearCustomerActivityEvidence,
} from "../lib/release/customer/customer-activity-evidence";
import {
  buildCustomerLifecycleRegistry,
  clearCustomerLifecycleRegistry,
} from "../lib/release/customer/customer-lifecycle-registry";
import {
  buildPg2FreezeManifest,
  clearPg2FreezeManifest,
} from "../lib/release/customer/pg2-freeze-manifest";
import {
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  buildReleaseHealthRegistry,
  clearReleaseHealthRegistry,
} from "../lib/release/health/release-health-registry";
import {
  buildDeploymentEvidenceFoundation,
  clearDeploymentEvidenceFoundation,
} from "../lib/release/health/deployment-evidence-foundation";
import {
  buildPg1FreezeManifest,
  clearPg1FreezeManifest,
} from "../lib/release/health/pg1-freeze-manifest";
import {
  buildProductionAuditFoundation,
  clearProductionAuditFoundation,
} from "../lib/release/health/production-audit-foundation";
import {
  buildRuntimeHealthFoundation,
  clearRuntimeHealthFoundation,
} from "../lib/release/health/runtime-health-foundation";
import {
  buildProductionValidation,
  clearProductionValidation,
} from "../lib/release/production-validation";
import {
  buildCommercialHealth as buildPgCommercialHealth,
  clearCommercialHealth as clearPgCommercialHealth,
} from "../lib/release/revenue/commercial-health";
import {
  buildGrowthEvidence,
  clearGrowthEvidence,
} from "../lib/release/revenue/growth-evidence";
import {
  buildPg3FreezeManifest,
  clearPg3FreezeManifest,
} from "../lib/release/revenue/pg3-freeze-manifest";
import {
  buildRevenueLifecycleRegistry,
  clearRevenueLifecycleRegistry,
} from "../lib/release/revenue/revenue-lifecycle-registry";
import {
  buildReleaseCandidate,
  clearReleaseCandidate,
} from "../lib/release/release-candidate";
import {
  buildReleaseReadiness,
  clearReleaseReadiness,
} from "../lib/release/release-readiness";
import {
  ESOS_1_ID,
  buildOperationsSurface,
  clearOperationsSurface,
  getOperationsSurface,
} from "../lib/commercial/operations-surface";
import * as intelligenceRoute from "../app/api/product/intelligence/route";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  ENTERPRISE_SAAS_OPERATIONS_SURFACE_V1,
  ENTERPRISE_SAAS_PRODUCT_INTELLIGENCE_V1,
  EPI_COMPONENTS,
  EPI_FREEZE_DATE,
  EPI_FREEZE_ID,
  EPI_FREEZE_VERSION,
  EPI_WP1_ID,
  EPI_WP2_ID,
  EPI_WP3_ID,
  EPI_WP4_ID,
  EPI_WP5_ID,
  PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT,
  buildEpiFreeze,
  clearEpiFreeze,
  clearProductIntelligenceAdoption,
  clearProductIntelligenceExposure,
  clearProductIntelligenceFeedback,
  clearProductIntelligenceView,
  getEpiFreeze,
  getProductIntelligenceAdoption,
  getProductIntelligenceExposure,
  getProductIntelligenceFeedback,
  getProductIntelligenceView,
} from "../lib/product/intelligence";
import {
  buildEspoFreeze,
  buildOperatingDecision,
  buildOperatingFeedback,
  buildOperatingOutcome,
  buildOperatingQueue,
  clearEspoFreeze,
  clearOperatingDecision,
  clearOperatingFeedback,
  clearOperatingOutcome,
  clearOperatingQueue,
  getEspoFreeze,
} from "../lib/commercial/production-ops";
import {
  buildCustomerPlanAction,
  buildCustomerPlanPortfolio,
  buildCustomerPlanState,
  buildEscpFreeze,
  clearCustomerPlanAction,
  clearCustomerPlanPortfolio,
  clearCustomerPlanState,
  clearEscpFreeze,
} from "../lib/commercial/planning";
import {
  buildCustomerIntelligenceState,
  buildCustomerPortfolioIntelligence,
  buildEsciFreeze,
  buildIntelligenceRecommendation,
  buildIntelligenceSignal,
  clearCustomerIntelligenceState,
  clearCustomerPortfolioIntelligence,
  clearEsciFreeze,
  clearIntelligenceRecommendation,
  clearIntelligenceSignal,
} from "../lib/commercial/intelligence";
import {
  buildAdvocacyActionSignal,
  buildAdvocacyReadiness,
  buildAdvocacyState,
  buildEscaFreeze,
  clearAdvocacyActionSignal,
  clearAdvocacyReadiness,
  clearAdvocacyState,
  clearEscaFreeze,
} from "../lib/commercial/advocacy";
import {
  buildEsrnFreeze,
  buildRenewalActionSignal,
  buildRenewalReadiness,
  buildRenewalState,
  clearEsrnFreeze,
  clearRenewalActionSignal,
  clearRenewalReadiness,
  clearRenewalState,
} from "../lib/commercial/renewal";
import {
  buildExpansionFeedback,
  buildExpansionOpportunity,
  buildExpansionOutcome,
  buildExpansionRecommendation,
  buildExpansionState,
  buildEsxpFreeze,
  clearExpansionFeedback,
  clearExpansionOpportunity,
  clearExpansionOutcome,
  clearExpansionRecommendation,
  clearExpansionState,
  clearEsxpFreeze,
} from "../lib/commercial/expansion";
import {
  buildRetentionIntervention,
  buildRetentionOutcome,
  buildRetentionReview,
  buildRetentionState,
  clearRetentionIntervention,
  clearRetentionOutcome,
  clearRetentionReview,
  clearRetentionState,
} from "../lib/commercial/retention";
import {
  buildCustomerSuccessIntervention,
  buildCustomerSuccessOutcome,
  buildCustomerSuccessReview,
  buildCustomerSuccessState,
  clearCustomerSuccessIntervention,
  clearCustomerSuccessOutcome,
  clearCustomerSuccessReview,
  clearCustomerSuccessState,
} from "../lib/commercial/customer-success";
import {
  buildCustomerLifecycleState,
  buildLifecycleAction,
  buildLifecycleReview,
  buildLifecycleTransition,
  clearCustomerLifecycleState,
  clearLifecycleAction,
  clearLifecycleReview,
  clearLifecycleTransition,
} from "../lib/commercial/lifecycle";
import {
  buildCommercialExecution,
  buildExecutionFeedback,
  buildExecutionOutcome,
  clearCommercialExecution,
  clearExecutionFeedback,
  clearExecutionOutcome,
} from "../lib/commercial/execution";
import {
  buildCommercialActionSignal,
  buildCommercialHealth,
  buildCommercialOperations,
  clearCommercialActionSignal,
  clearCommercialHealth,
  clearCommercialOperations,
} from "../lib/commercial/operations";
import {
  buildOperationsFeedback,
  clearOperationsFeedback,
} from "../lib/runtime/feedback";
import {
  buildRuntimeOperationsFreeze,
  clearRuntimeOperationsFreeze,
} from "../lib/runtime/freeze";
import { buildRuntimeHealth, clearRuntimeHealth } from "../lib/runtime/health";
import {
  buildRuntimeIncidents,
  clearRuntimeIncidents,
} from "../lib/runtime/incident";
import {
  buildApplicationMonitoring,
  clearApplicationMonitoring,
} from "../lib/runtime/monitoring";
import {
  buildRecoveryWorkflow,
  clearRecoveryWorkflow,
} from "../lib/runtime/recovery";
import {
  buildServiceReliability,
  clearServiceReliability,
} from "../lib/runtime/reliability";
import {
  buildTenantOperations,
  clearTenantOperations,
} from "../lib/runtime/tenant";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== EPI v1 Freeze Gate ===\n");

  clearEpiFreeze();
  clearProductIntelligenceFeedback();
  clearProductIntelligenceAdoption();
  clearProductIntelligenceExposure();
  clearProductIntelligenceView();
  clearOperationsSurface();
  clearEspoFreeze();
  clearOperatingFeedback();
  clearOperatingOutcome();
  clearOperatingDecision();
  clearOperatingQueue();
  clearEscpFreeze();
  clearCustomerPlanPortfolio();
  clearCustomerPlanAction();
  clearCustomerPlanState();
  clearEsciFreeze();
  clearIntelligenceRecommendation();
  clearCustomerPortfolioIntelligence();
  clearIntelligenceSignal();
  clearCustomerIntelligenceState();
  clearEscaFreeze();
  clearAdvocacyActionSignal();
  clearAdvocacyReadiness();
  clearAdvocacyState();
  clearEsrnFreeze();
  clearRenewalActionSignal();
  clearRenewalReadiness();
  clearRenewalState();
  clearEsxpFreeze();
  clearExpansionFeedback();
  clearExpansionOutcome();
  clearExpansionRecommendation();
  clearExpansionOpportunity();
  clearExpansionState();
  clearRetentionReview();
  clearRetentionOutcome();
  clearRetentionIntervention();
  clearRetentionState();
  clearCustomerSuccessReview();
  clearCustomerSuccessOutcome();
  clearCustomerSuccessIntervention();
  clearCustomerSuccessState();
  clearLifecycleReview();
  clearLifecycleAction();
  clearLifecycleTransition();
  clearCustomerLifecycleState();
  clearExecutionFeedback();
  clearExecutionOutcome();
  clearCommercialExecution();
  clearCommercialActionSignal();
  clearCommercialHealth();
  clearCommercialOperations();
  clearRuntimeOperationsFreeze();
  clearOperationsFeedback();
  clearServiceReliability();
  clearTenantOperations();
  clearRecoveryWorkflow();
  clearRuntimeIncidents();
  clearApplicationMonitoring();
  clearRuntimeHealth();
  clearApplicationReleaseFeedback();
  clearApplicationProductionRelease();
  clearApplicationDeploymentEvidence();
  clearApplicationReleaseVerification();
  clearApplicationReleaseCandidate();
  clearApplicationReleaseChange();
  clearPg3FreezeManifest();
  clearGrowthEvidence();
  clearPgCommercialHealth();
  clearRevenueLifecycleRegistry();
  clearPg2FreezeManifest();
  clearCustomerActivityEvidence();
  clearAdoptionHealth();
  clearCustomerLifecycleRegistry();
  clearPg1FreezeManifest();
  clearProductionAuditFoundation();
  clearDeploymentEvidenceFoundation();
  clearRuntimeHealthFoundation();
  clearReleaseHealthRegistry();
  clearGaRelease();
  clearProductionValidation();
  clearReleaseCandidate();
  clearReleaseReadiness();

  buildReleaseReadiness();
  buildReleaseCandidate();
  buildProductionValidation();
  buildGaRelease();
  buildReleaseHealthRegistry();
  buildRuntimeHealthFoundation();
  buildDeploymentEvidenceFoundation();
  buildProductionAuditFoundation();
  buildPg1FreezeManifest();
  buildCustomerLifecycleRegistry();
  buildAdoptionHealth();
  buildCustomerActivityEvidence();
  buildPg2FreezeManifest();
  buildRevenueLifecycleRegistry();
  buildPgCommercialHealth();
  buildGrowthEvidence();
  buildPg3FreezeManifest();
  buildApplicationReleaseChange();
  buildApplicationReleaseCandidate();
  buildApplicationReleaseVerification();
  buildApplicationDeploymentEvidence();
  buildApplicationProductionRelease();
  buildApplicationReleaseFeedback();
  buildRuntimeHealth();
  buildApplicationMonitoring();
  buildRuntimeIncidents();
  buildRecoveryWorkflow();
  buildTenantOperations();
  buildServiceReliability();
  buildOperationsFeedback();
  buildRuntimeOperationsFreeze();
  buildCommercialOperations();
  buildCommercialHealth();
  buildCommercialActionSignal();
  buildCommercialExecution();
  buildExecutionOutcome();
  buildExecutionFeedback();
  buildCustomerLifecycleState();
  buildLifecycleTransition();
  buildLifecycleAction();
  buildLifecycleReview();
  buildCustomerSuccessState();
  buildCustomerSuccessIntervention();
  buildCustomerSuccessOutcome();
  buildCustomerSuccessReview();
  buildRetentionState();
  buildRetentionIntervention();
  buildRetentionOutcome();
  buildRetentionReview();
  buildExpansionState();
  buildExpansionOpportunity();
  buildExpansionRecommendation();
  buildExpansionOutcome();
  buildExpansionFeedback();
  buildEsxpFreeze();
  buildRenewalState();
  buildRenewalReadiness();
  buildRenewalActionSignal();
  buildEsrnFreeze();
  buildAdvocacyState();
  buildAdvocacyReadiness();
  buildAdvocacyActionSignal();
  buildEscaFreeze();
  buildCustomerIntelligenceState();
  buildIntelligenceSignal();
  buildCustomerPortfolioIntelligence();
  buildIntelligenceRecommendation();
  buildEsciFreeze();
  buildCustomerPlanState();
  buildCustomerPlanAction();
  buildCustomerPlanPortfolio();
  buildEscpFreeze();
  const queue = buildOperatingQueue();
  const decisions = buildOperatingDecision(queue);
  const outcomes = buildOperatingOutcome(decisions);
  const feedback = buildOperatingFeedback(outcomes);
  const freeze = buildEspoFreeze();
  const freezeFp = freeze.fingerprint;
  const surface = buildOperationsSurface();
  const surfaceFp = surface.fingerprint;
  const view = getProductIntelligenceView();
  const exposure = getProductIntelligenceExposure();
  const adoption = getProductIntelligenceAdoption();
  const epiFeedback = getProductIntelligenceFeedback();
  const first = buildEpiFreeze();

  assert(first.id === EPI_FREEZE_ID, "freeze id");
  assert(first.version === EPI_FREEZE_VERSION, "freeze version");
  assert(first.freezeDate === EPI_FREEZE_DATE, "freeze date");
  assert(first.baseline === ENTERPRISE_SAAS_OPERATIONS_SURFACE_V1, "baseline");
  assert(first.product === ENTERPRISE_SAAS_PRODUCT_INTELLIGENCE_V1, "product");
  assert(first.components === EPI_COMPONENTS, "components const");
  assert(first.components.length === 5, "WP1~WP5");
  assert(
    first.components.map((c) => c.id).join(",") ===
      `${EPI_WP1_ID},${EPI_WP2_ID},${EPI_WP3_ID},${EPI_WP4_ID},${EPI_WP5_ID}`,
    "chain order",
  );
  assert(
    first.components.every((c) => c.status === "frozen"),
    "all frozen",
  );
  assert(
    first.scope.chain ===
      "VIEW -> API -> EXPOSURE -> ADOPTION -> FEEDBACK -> FROZEN",
    "chain",
  );
  assert(first.certification === "certified", "certified");
  assert(first.scope.freezeOnly === true, "freezeOnly");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noPersistence === true, "noPersistence");
  assert(first.scope.noRuntimeSideEffects === true, "noRuntimeSideEffects");
  assert(first.scope.noFrozenLayerChanges === true, "noFrozenLayerChanges");
  assert(first.componentFingerprints["EPI-WP1"] === view.fingerprint, "WP1 fp");
  assert(first.componentFingerprints["EPI-WP2"] === view.fingerprint, "WP2 fp");
  assert(first.componentFingerprints["EPI-WP3"] === exposure.fingerprint, "WP3 fp");
  assert(first.componentFingerprints["EPI-WP4"] === adoption.fingerprint, "WP4 fp");
  assert(first.componentFingerprints["EPI-WP5"] === epiFeedback.fingerprint, "WP5 fp");
  assert(first.fingerprint.length === 64, "fingerprint");
  for (const component of first.components) {
    assert(
      existsSync(join(process.cwd(), component.modulePath)),
      `${component.id} module`,
    );
    assert(
      existsSync(join(process.cwd(), component.verifyScript)),
      `${component.id} verify`,
    );
  }
  assert(typeof intelligenceRoute.GET === "function", "WP2 GET");
  assert(
    typeof (intelligenceRoute as { POST?: unknown }).POST === "undefined",
    "no POST",
  );
  const response = await intelligenceRoute.GET();
  assert(response.status === 200, "GET status");
  const body = (await response.json()) as ReturnType<
    typeof getProductIntelligenceView
  >;
  assert(body.fingerprint === view.fingerprint, "API view");
  assert(body.id === EPI_WP1_ID, "API id");
  assert(exposure.endpoint === PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT, "endpoint");
  assert(view.scope.parentPack === ESOS_1_ID, "parent ESOS-1");
  assert(getEspoFreeze().fingerprint === freezeFp, "no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "no ESOS mutation");
  assert(queue.openCount === view.signals.openCount, "queue frozen");
  assert(decisions.actCount === view.recommendations.actCount, "decision frozen");
  assert(outcomes.recordedCount === view.recommendations.recordedCount, "outcome frozen");
  assert(feedback.escalateCount === view.signals.escalateCount, "feedback frozen");
  console.log("PASS Freeze integrity");

  const second = getEpiFreeze();
  assert(second.fingerprint === first.fingerprint, "deterministic get");
  const mutated = getEpiFreeze();
  (mutated as { certification: string }).certification = "blocked";
  assert(getEpiFreeze().certification === "certified", "clone-on-get");
  clearEpiFreeze();
  const third = buildEpiFreeze();
  assert(third.fingerprint === first.fingerprint, "after clear");
  assert(getProductIntelligenceFeedback().fingerprint === epiFeedback.fingerprint, "no WP5 mutation");
  assert(getProductIntelligenceAdoption().fingerprint === adoption.fingerprint, "no WP4 mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "still no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "still no ESOS mutation");
  console.log("PASS Deterministic");

  console.log("\n=== EPI v1 FREEZE VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`version: ${first.version}`);
  console.log(`baseline: ${first.baseline}`);
  console.log(`product: ${first.product}`);
}

void main();
