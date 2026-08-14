/**
 * EWXR-1 — Workspace REVIEW Action verification
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
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ESOS_1_ID,
  buildOperationsSurface,
  clearOperationsSurface,
  getOperationsSurface,
} from "../lib/commercial/operations-surface";
import {
  EWEB_1_ID,
  ACTION_EXECUTION_REQUEST_STATES,
  ACTION_EXECUTION_VERSION,
  CONTROLLED_ACTION_API,
  CONTROLLED_ACTION_VERSION,
  EWXR_1_ID,
  SUPPORTED_CONTROLLED_ACTION_INTENT,
  WORKSPACE_REVIEW_ACTION_VERSION,
  buildActionExecutionRequests,
  buildEwebFreeze,
  buildEwerFreeze,
  clearActionExecutionRequests,
  clearEwebFreeze,
  clearEwerFreeze,
  executeControlledAction,
  getActionExecutionRequests,
  getEwebFreeze,
  getEwerFreeze,
  listWorkspaceReviewSurfaceItemIds,
  runWorkspaceReviewAction,
} from "../lib/commercial/action-execution";
import {
  EWI_1_ID,
  ACTION_INTENT_VERSION,
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
  EWAS_1_ID,
  WORKSPACE_ACTION_SURFACE_VERSION,
  buildWorkspaceActionSurface,
  clearWorkspaceActionSurface,
  getWorkspaceActionSurface,
} from "../lib/workflow/experience/workspace-action-surface";
import {
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
  getCustomerSuccessReview,
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
  console.log("=== EWXR-1 Workspace REVIEW Action ===\n");

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
  const view = buildProductIntelligenceView();
  const viewFp = view.fingerprint;
  buildEpiFreeze();
  const pex = buildPexFreeze();
  const pexFp = pex.fingerprint;
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
  const reviewPack = getCustomerSuccessReview();
  const reviewFp = reviewPack.fingerprint;

  assert(requests.workPackageId === EWEB_1_ID, "eweb id");
  assert(requests.baselineTag === ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1, "eweb baseline");
  assert(requests.parentPack === EWI_1_ID, "eweb parent");
  assert(requests.parentVersion === ACTION_INTENT_VERSION, "eweb parent version");
  assert(requests.version === ACTION_EXECUTION_VERSION, "eweb version");
  assert(
    requests.records.every((r) =>
      (ACTION_EXECUTION_REQUEST_STATES as readonly string[]).includes(
        r.requestState,
      ),
    ),
    "requestState enum",
  );
  assert(requests.fingerprint === "e0cf47cab1ec4a1b3b0fac957b92fd9726a817d259409c6b3ad5ee7db03b9b25", "frozen EWEB-1 fp");
  assert(eweb.fingerprint === "e4a37df35cd54500b36cde9b857b700b76ec9be198ccab0c9159b6709cdd8e8d", "frozen EWEB freeze fp");
  assert(ewer.fingerprint === "668ee5c704c4eb4f48bd3e6dd42ebc327736b955c0687cfd1aea45ce8406e595", "frozen EWER freeze fp");
  assert(ewer.supportedIntent === "REVIEW", "EWER REVIEW only");
  assert(ewas.id.length > 0 || EWAS_1_ID === "EWAS-1", "ewas present");
  assert(WORKSPACE_ACTION_SURFACE_VERSION.length > 0, "ewas version");
  assert(ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1.length > 0, "wfx baseline");
  assert(ESOS_1_ID === "ESOS-1", "esos id");
  assert(viewFp.length === 64, "epi fp");
  assert(pexFp.length === 64, "pex fp");
  assert(wfxFp.length === 64, "wfx fp");
  assert(CONTROLLED_ACTION_API === "getCustomerSuccessReview", "ewer api");
  assert(CONTROLLED_ACTION_VERSION.length > 0, "ewer version");

  const reviewIntent = intents.records.find(
    (r) => r.intent === SUPPORTED_CONTROLLED_ACTION_INTENT,
  );
  assert(reviewIntent, "REVIEW intent");
  const otherIntent = intents.records.find(
    (r) => r.intent !== SUPPORTED_CONTROLLED_ACTION_INTENT,
  );
  assert(otherIntent, "non-REVIEW intent");

  const reviewIds = listWorkspaceReviewSurfaceItemIds();
  assert(reviewIds.includes(reviewIntent.surfaceItemId), "REVIEW listed");
  assert(!reviewIds.includes(otherIntent.surfaceItemId), "non-REVIEW not listed");

  const success = runWorkspaceReviewAction(reviewIntent.surfaceItemId);
  assert(success.workPackageId === EWXR_1_ID, "ewxr id");
  assert(success.version === WORKSPACE_REVIEW_ACTION_VERSION, "ewxr version");
  assert(success.result === "SUCCESS", "READY REVIEW executes");
  assert(success.executed === true, "executed");
  assert(success.ewerFingerprint !== null, "ewer fingerprint");
  const ewerResult = executeControlledAction(
    requests.records.find((r) => r.intentId === reviewIntent.id)!,
  );
  assert(success.ewerFingerprint === ewerResult.fingerprint, "reuses EWER-1");
  assert(ewerResult.result === "SUCCESS", "EWER SUCCESS");
  console.log("PASS REVIEW executes");

  const notReview = runWorkspaceReviewAction(otherIntent.surfaceItemId);
  assert(notReview.result === "FAILED", "non-REVIEW failed");
  assert(notReview.executed === false, "non-REVIEW not executed");
  assert(notReview.reason === "workspace-item-not-review", "non-REVIEW reason");
  console.log("PASS other intents do not execute");

  const again = runWorkspaceReviewAction(reviewIntent.surfaceItemId);
  assert(again.fingerprint === success.fingerprint, "idempotent SUCCESS");
  const notReviewAgain = runWorkspaceReviewAction(otherIntent.surfaceItemId);
  assert(notReviewAgain.fingerprint === notReview.fingerprint, "idempotent FAILED");
  const mutated = runWorkspaceReviewAction(reviewIntent.surfaceItemId);
  (mutated as { result: string }).result = "FAILED";
  assert(
    runWorkspaceReviewAction(reviewIntent.surfaceItemId).result === "SUCCESS",
    "clone-on-return",
  );
  console.log("PASS deterministic result");

  const panelPath = join(
    process.cwd(),
    "app/(workspace)/WorkspaceActionSurfacePanel.tsx",
  );
  assert(existsSync(panelPath), "panel module");
  const panelSrc = readFileSync(panelPath, "utf8");
  assert(panelSrc.includes("readWorkspaceActionSurface"), "EWUI reader");
  assert(panelSrc.includes("ATTENTION"), "EWUI attention");
  assert(panelSrc.includes("AVAILABLE"), "EWUI available");
  assert(panelSrc.includes("DEFERRED"), "EWUI deferred");
  assert(panelSrc.includes("surface.items"), "EWUI items");
  assert(panelSrc.includes("No workspace actions"), "EWUI empty");
  assert(panelSrc.includes("WorkspaceReviewActionControl"), "REVIEW control");
  const controlSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/WorkspaceReviewActionControl.tsx"),
    "utf8",
  );
  assert(controlSrc.includes("REVIEW"), "REVIEW trigger");
  assert(controlSrc.includes("SUCCESS"), "show SUCCESS");
  assert(controlSrc.includes("BLOCKED"), "show BLOCKED");
  assert(controlSrc.includes("FAILED"), "show FAILED");
  const adapterSrc = readFileSync(
    join(
      process.cwd(),
      "lib/commercial/action-execution/workspace-review-action.ts",
    ),
    "utf8",
  );
  assert(adapterSrc.includes("executeControlledAction"), "calls EWER-1");
  console.log("PASS workspace UI wiring");

  assert(getActionExecutionRequests().fingerprint === requestsFp, "no EWEB-1 mutation");
  assert(getEwebFreeze().fingerprint === ewebFp, "no EWEB freeze mutation");
  assert(getEwerFreeze().fingerprint === ewerFp, "no EWER freeze mutation");
  assert(getActionIntents().fingerprint === intentsFp, "no EWI-1 mutation");
  assert(getEwiFreeze().fingerprint === ewiFp, "no EWI freeze mutation");
  assert(getWorkspaceActionSurface().fingerprint === actionSurfaceFp, "no EWUI/EWAS-1 mutation");
  assert(getActionConsumptionItems().fingerprint === consumptionFp, "no EAC mutation");
  assert(getActionDeliveryItems().fingerprint === deliveryFp, "no EADS-1 mutation");
  assert(getWorkspaceActionOutcomes().fingerprint === outcomesFp, "no EWA-3 mutation");
  assert(getEwaFreeze().fingerprint === ewaFp, "no EWA freeze mutation");
  assert(getEadsFreeze().fingerprint === eadsFp, "no EADS freeze mutation");
  assert(getEacFreeze().fingerprint === eacFp, "no EAC freeze mutation");
  assert(getEwasFreeze().fingerprint === ewasFp, "no EWAS freeze mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "no ESOS mutation");
  assert(getCustomerSuccessReview().fingerprint === reviewFp, "no ESCS review mutation");
  console.log("PASS frozen fingerprints unchanged");

  console.log("\n=== EWXR-1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${success.fingerprint}`);
  console.log(`result: ${success.result}`);
  console.log(`supportedIntent: ${SUPPORTED_CONTROLLED_ACTION_INTENT}`);
}

main();
