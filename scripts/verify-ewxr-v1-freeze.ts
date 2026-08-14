/**
 * EWXR v1 Freeze — Workspace REVIEW Action EWXR-1 evidence verification
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
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  EWXR_1_ID,
  EWXR_COMPONENTS,
  EWXR_FREEZE_DATE,
  EWXR_FREEZE_ID,
  EWXR_FREEZE_VERSION,
  ENTERPRISE_SAAS_CONTROLLED_ACTION_V1,
  ENTERPRISE_SAAS_WORKSPACE_REVIEW_ACTION_V1,
  SUPPORTED_CONTROLLED_ACTION_INTENT,
  buildActionExecutionRequests,
  buildEwebFreeze,
  buildEwerFreeze,
  buildEwxrFreeze,
  clearActionExecutionRequests,
  clearEwebFreeze,
  clearEwerFreeze,
  clearEwxrFreeze,
  getActionExecutionRequests,
  getEwebFreeze,
  getEwerFreeze,
  getEwxrFreeze,
  listWorkspaceReviewSurfaceItemIds,
  runWorkspaceReviewAction,
} from "../lib/commercial/action-execution";
import {
  ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1,
  buildActionIntents,
  buildEwiFreeze,
  clearActionIntents,
  clearEwiFreeze,
  getActionIntents,
  getEwiFreeze,
} from "../lib/commercial/action-intent";
import {
  buildActionConsumptionItems,
  buildEacFreeze,
  clearActionConsumptionItems,
  clearEacFreeze,
  getActionConsumptionItems,
  getEacFreeze,
} from "../lib/commercial/action-consumption";
import {
  buildActionDeliveryItems,
  buildEadsFreeze,
  clearActionDeliveryItems,
  clearEadsFreeze,
  getActionDeliveryItems,
  getEadsFreeze,
} from "../lib/commercial/action-delivery";
import {
  buildEwaFreeze,
  buildWorkspaceActionContexts,
  buildWorkspaceActionOutcomes,
  buildWorkspaceActions,
  clearEwaFreeze,
  clearWorkspaceActionContexts,
  clearWorkspaceActionOutcomes,
  clearWorkspaceActions,
  getEwaFreeze,
  getWorkspaceActionOutcomes,
} from "../lib/commercial/workspace-action";
import {
  buildWorkspaceActionSurface,
  clearWorkspaceActionSurface,
  getWorkspaceActionSurface,
} from "../lib/workflow/experience/workspace-action-surface";
import {
  ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1,
  buildEwasFreeze,
  clearEwasFreeze,
  getEwasFreeze,
} from "../lib/workflow/experience/ewas-freeze-manifest";
import {
  buildProductIntelligenceView,
  clearEpiFreeze,
  clearProductIntelligenceView,
  getProductIntelligenceView,
  buildEpiFreeze,
} from "../lib/product/intelligence";
import {
  buildPexFreeze,
  clearPexFreeze,
  getPexFreeze,
} from "../lib/product/experience";
import {
  ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1,
  buildWfxFreeze,
  clearWfxFreeze,
  getWfxFreeze,
} from "../lib/workflow/experience";
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

function main() {
  console.log("=== EWXR v1 Freeze Gate ===\n");

  clearEwxrFreeze();
  clearEwerFreeze();
  clearEwebFreeze();
  clearActionExecutionRequests();
  clearEwiFreeze();
  clearActionIntents();
  clearWorkspaceActionSurface();
  clearEwasFreeze();
  clearEacFreeze();
  clearActionConsumptionItems();
  clearEadsFreeze();
  clearActionDeliveryItems();
  clearEwaFreeze();
  clearWorkspaceActionOutcomes();
  clearWorkspaceActionContexts();
  clearWorkspaceActions();
  clearWfxFreeze();
  clearPexFreeze();
  clearEpiFreeze();
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
  const opOutcomes = buildOperatingOutcome(decisions);
  buildOperatingFeedback(opOutcomes);
  const freeze = buildEspoFreeze();
  const freezeFp = freeze.fingerprint;
  const surface = buildOperationsSurface();
  const surfaceFp = surface.fingerprint;
  buildProductIntelligenceView();
  buildEpiFreeze();
  buildPexFreeze();
  const wfx = buildWfxFreeze();
  const wfxFp = wfx.fingerprint;
  buildWorkspaceActions();
  buildWorkspaceActionContexts();
  const ewaOutcomes = buildWorkspaceActionOutcomes();
  const outcomesFp = ewaOutcomes.fingerprint;
  const ewa = buildEwaFreeze();
  const ewaFp = ewa.fingerprint;
  const delivery = buildActionDeliveryItems();
  const deliveryFp = delivery.fingerprint;
  const eads = buildEadsFreeze();
  const eadsFp = eads.fingerprint;
  const consumption = buildActionConsumptionItems();
  const consumptionFp = consumption.fingerprint;
  const eac = buildEacFreeze();
  const eacFp = eac.fingerprint;
  const actionSurface = buildWorkspaceActionSurface();
  const actionSurfaceFp = actionSurface.fingerprint;
  const ewas = buildEwasFreeze();
  const ewasFp = ewas.fingerprint;
  const intents = buildActionIntents();
  const intentsFp = intents.fingerprint;
  const ewi = buildEwiFreeze();
  const ewiFp = ewi.fingerprint;
  const requests = buildActionExecutionRequests();
  const requestsFp = requests.fingerprint;
  const eweb = buildEwebFreeze();
  const ewebFp = eweb.fingerprint;
  const ewer = buildEwerFreeze();
  const ewerFp = ewer.fingerprint;
  const reviewIds = listWorkspaceReviewSurfaceItemIds();
  assert(reviewIds.length > 0, "REVIEW surface items");
  const canonical = runWorkspaceReviewAction(reviewIds[0]!);
  assert(canonical.result === "SUCCESS", "canonical SUCCESS");
  assert(canonical.workPackageId === EWXR_1_ID, "EWXR-1 result");
  const first = buildEwxrFreeze();

  assert(first.id === EWXR_FREEZE_ID, "freeze id");
  assert(first.version === EWXR_FREEZE_VERSION, "freeze version");
  assert(first.freezeDate === EWXR_FREEZE_DATE, "freeze date");
  assert(first.baseline === ENTERPRISE_SAAS_CONTROLLED_ACTION_V1, "baseline");
  assert(first.product === ENTERPRISE_SAAS_WORKSPACE_REVIEW_ACTION_V1, "product");
  assert(first.components === EWXR_COMPONENTS, "components const");
  assert(first.components.length === 1, "EWXR-1 only");
  assert(first.components[0]!.id === EWXR_1_ID, "chain order");
  assert(
    first.components.every((c) => c.status === "frozen"),
    "all frozen",
  );
  assert(
    first.scope.chain === "CONTROLLED-ACTION -> WORKSPACE-REVIEW -> FROZEN",
    "chain",
  );
  assert(first.scope.components === "EWXR-1", "scope components");
  assert(first.scope.supportedAction === "REVIEW", "REVIEW only");
  assert(first.supportedIntent === SUPPORTED_CONTROLLED_ACTION_INTENT, "supportedIntent");
  assert(first.certification === "certified", "certified");
  assert(first.scope.freezeOnly === true, "freezeOnly");
  assert(first.scope.singleActionType === true, "singleActionType");
  assert(first.scope.noExecutionEngine === true, "noExecutionEngine");
  assert(first.scope.noPersistence === true, "noPersistence");
  assert(first.scope.noPrisma === true, "noPrisma");
  assert(first.scope.noFrozenLayerChanges === true, "noFrozenLayerChanges");
  assert(first.ewerFreezeFingerprint === ewerFp, "EWER freeze locked");
  assert(first.ewerFreezeFingerprint === "668ee5c704c4eb4f48bd3e6dd42ebc327736b955c0687cfd1aea45ce8406e595", "frozen EWER freeze fp");
  assert(ewebFp === "e4a37df35cd54500b36cde9b857b700b76ec9be198ccab0c9159b6709cdd8e8d", "frozen EWEB freeze fp");
  assert(requestsFp === "e0cf47cab1ec4a1b3b0fac957b92fd9726a817d259409c6b3ad5ee7db03b9b25", "frozen EWEB-1 fp");
  assert(first.componentFingerprints["EWXR-1"].length === 64, "EWXR-1 fp");
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
  assert(
    existsSync(join(process.cwd(), "app/(workspace)/WorkspaceActionSurfacePanel.tsx")),
    "workspace panel",
  );
  assert(
    existsSync(join(process.cwd(), "app/(workspace)/WorkspaceReviewActionControl.tsx")),
    "REVIEW control",
  );
  assert(getActionExecutionRequests().fingerprint === requestsFp, "no EWEB-1 mutation");
  assert(getEwebFreeze().fingerprint === ewebFp, "no EWEB freeze mutation");
  assert(getEwerFreeze().fingerprint === ewerFp, "no EWER freeze mutation");
  assert(getActionIntents().fingerprint === intentsFp, "no EWI-1 mutation");
  assert(getWorkspaceActionSurface().fingerprint === actionSurfaceFp, "no EWUI/EWAS-1 mutation");
  assert(getActionConsumptionItems().fingerprint === consumptionFp, "no EAC-1 mutation");
  assert(getActionDeliveryItems().fingerprint === deliveryFp, "no EADS-1 mutation");
  assert(getWorkspaceActionOutcomes().fingerprint === outcomesFp, "no EWA-3 mutation");
  assert(getEwaFreeze().fingerprint === ewaFp, "no EWA freeze mutation");
  assert(getEadsFreeze().fingerprint === eadsFp, "no EADS freeze mutation");
  assert(getEacFreeze().fingerprint === eacFp, "no EAC freeze mutation");
  assert(getEwasFreeze().fingerprint === ewasFp, "no EWAS freeze mutation");
  assert(getEwiFreeze().fingerprint === ewiFp, "no EWI freeze mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "no ESOS mutation");
  assert(getWfxFreeze().fingerprint === wfxFp, "no WFX mutation");
  assert(ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1.length > 0, "ewi product");
  console.log("PASS Freeze integrity");

  const second = getEwxrFreeze();
  assert(second.fingerprint === first.fingerprint, "deterministic get");
  const mutated = getEwxrFreeze();
  (mutated as { certification: string }).certification = "blocked";
  assert(getEwxrFreeze().certification === "certified", "clone-on-get");
  clearEwxrFreeze();
  const third = buildEwxrFreeze();
  assert(third.fingerprint === first.fingerprint, "after clear");
  assert(getActionExecutionRequests().fingerprint === requestsFp, "still no EWEB-1 mutation");
  assert(getEwebFreeze().fingerprint === ewebFp, "still no EWEB freeze mutation");
  assert(getEwerFreeze().fingerprint === ewerFp, "still no EWER freeze mutation");
  assert(getActionIntents().fingerprint === intentsFp, "still no EWI-1 mutation");
  assert(getWorkspaceActionSurface().fingerprint === actionSurfaceFp, "still no EWAS-1 mutation");
  assert(getActionConsumptionItems().fingerprint === consumptionFp, "still no EAC-1 mutation");
  assert(getActionDeliveryItems().fingerprint === deliveryFp, "still no EADS-1 mutation");
  assert(getWorkspaceActionOutcomes().fingerprint === outcomesFp, "still no EWA-3 mutation");
  assert(getEwaFreeze().fingerprint === ewaFp, "still no EWA freeze mutation");
  assert(getEadsFreeze().fingerprint === eadsFp, "still no EADS freeze mutation");
  assert(getEacFreeze().fingerprint === eacFp, "still no EAC freeze mutation");
  assert(getEwasFreeze().fingerprint === ewasFp, "still no EWAS freeze mutation");
  assert(getEwiFreeze().fingerprint === ewiFp, "still no EWI freeze mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "still no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "still no ESOS mutation");
  assert(getWfxFreeze().fingerprint === wfxFp, "still no WFX mutation");
  console.log("PASS Deterministic");

  console.log("\n=== EWXR v1 FREEZE VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`version: ${first.version}`);
  console.log(`baseline: ${first.baseline}`);
  console.log(`product: ${first.product}`);
}

main();
