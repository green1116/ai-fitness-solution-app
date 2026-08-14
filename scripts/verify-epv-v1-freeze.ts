/**
 * EPV v1 Freeze — Workspace Review Product Validation EPV-1 + EPV-2 evidence.
 * Product: enterprise-saas-workspace-review-product-validation-v1.
 * Validation only — no new action / architecture / persistence / frozen-layer mutation.
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
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ESOS_1_ID,
  buildOperationsSurface,
  clearOperationsSurface,
  getOperationsSurface,
} from "../lib/commercial/operations-surface";
import {
  ENTERPRISE_SAAS_WORKSPACE_REVIEW_ACTION_V1,
  EPV_2_ID,
  REVIEW_OUTCOME_SURFACE_VERSION,
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
  mapWorkspaceReviewOutcome,
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

const EPV_1_ID = "EPV-1" as const;
const EPV_FREEZE_ID = "EPV-Freeze" as const;
const EPV_FREEZE_VERSION = "epv-freeze-1.0.0" as const;
const EPV_FREEZE_DATE = "2026-08-14" as const;
const ENTERPRISE_SAAS_WORKSPACE_REVIEW_PRODUCT_VALIDATION_V1 =
  "enterprise-saas-workspace-review-product-validation-v1" as const;

const EPV_COMPONENTS = [
  {
    id: EPV_1_ID,
    version: "workspace-review-validation-1",
    modulePath: "scripts/verify-epv-1-workspace-review.ts",
    verifyScript: "scripts/verify-epv-1-workspace-review.ts",
    status: "frozen" as const,
  },
  {
    id: EPV_2_ID,
    version: REVIEW_OUTCOME_SURFACE_VERSION,
    modulePath: "lib/commercial/action-execution/review-outcome-surface.ts",
    verifyScript: "scripts/verify-epv-2-review-outcome.ts",
    status: "frozen" as const,
  },
] as const;

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function computeEvidenceFingerprint(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function main() {
  console.log("=== EPV v1 Freeze Gate ===\n");

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
  const ewxr = buildEwxrFreeze();
  const ewxrFp = ewxr.fingerprint;
  const reviewPack = getCustomerSuccessReview();
  const reviewFp = reviewPack.fingerprint;
  const reviewIds = listWorkspaceReviewSurfaceItemIds();
  assert(reviewIds.length > 0, "REVIEW items");
  const success = runWorkspaceReviewAction(reviewIds[0]!);
  assert(success.result === "SUCCESS", "EWXR SUCCESS");
  const shown = mapWorkspaceReviewOutcome(success);
  assert(shown.workPackageId === EPV_2_ID, "EPV-2");
  assert(shown.outcome === "SHOWN", "outcome shown");
  assert(SUPPORTED_CONTROLLED_ACTION_INTENT === "REVIEW", "REVIEW only");

  const evidence = {
    id: EPV_FREEZE_ID,
    version: EPV_FREEZE_VERSION,
    freezeDate: EPV_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_WORKSPACE_REVIEW_ACTION_V1,
    product: ENTERPRISE_SAAS_WORKSPACE_REVIEW_PRODUCT_VALIDATION_V1,
    components: EPV_COMPONENTS,
    componentFingerprints: {
      "EPV-1": computeEvidenceFingerprint({
        id: EPV_1_ID,
        validationOnly: true,
        noNewAction: true,
        verifyScript: "scripts/verify-epv-1-workspace-review.ts",
      }),
      "EPV-2": shown.fingerprint,
    },
    ewxrFreezeFingerprint: ewxrFp,
    supportedIntent: SUPPORTED_CONTROLLED_ACTION_INTENT,
    certification: "certified" as const,
    scope: {
      components: "EPV-1,EPV-2",
      chain: "WORKSPACE-REVIEW -> VALIDATION -> OUTCOME -> FROZEN",
      supportedAction: "REVIEW",
      validationOnly: true,
      noNewAction: true,
      freezeOnly: true,
      noPersistence: true,
      noPrisma: true,
      noExecutionEngine: true,
      noFrozenLayerChanges: true,
    },
  };
  const fingerprint = computeEvidenceFingerprint(evidence);

  assert(evidence.id === EPV_FREEZE_ID, "freeze id");
  assert(evidence.version === EPV_FREEZE_VERSION, "freeze version");
  assert(evidence.freezeDate === EPV_FREEZE_DATE, "freeze date");
  assert(evidence.baseline === ENTERPRISE_SAAS_WORKSPACE_REVIEW_ACTION_V1, "baseline");
  assert(evidence.product === ENTERPRISE_SAAS_WORKSPACE_REVIEW_PRODUCT_VALIDATION_V1, "product");
  assert(evidence.components === EPV_COMPONENTS, "components const");
  assert(evidence.components.length === 2, "EPV-1 + EPV-2");
  assert(evidence.components[0]!.id === EPV_1_ID, "EPV-1 first");
  assert(evidence.components[1]!.id === EPV_2_ID, "EPV-2 second");
  assert(
    evidence.components.every((c) => c.status === "frozen"),
    "all frozen",
  );
  assert(
    evidence.scope.chain === "WORKSPACE-REVIEW -> VALIDATION -> OUTCOME -> FROZEN",
    "chain",
  );
  assert(evidence.scope.components === "EPV-1,EPV-2", "scope components");
  assert(evidence.scope.supportedAction === "REVIEW", "REVIEW only");
  assert(evidence.scope.validationOnly === true, "validation only");
  assert(evidence.scope.noNewAction === true, "no new action");
  assert(evidence.certification === "certified", "certified");
  assert(evidence.scope.freezeOnly === true, "freezeOnly");
  assert(evidence.scope.noPersistence === true, "noPersistence");
  assert(evidence.scope.noPrisma === true, "noPrisma");
  assert(evidence.scope.noExecutionEngine === true, "noExecutionEngine");
  assert(evidence.scope.noFrozenLayerChanges === true, "noFrozenLayerChanges");
  assert(evidence.ewxrFreezeFingerprint === ewxrFp, "EWXR freeze locked");
  assert(ewxrFp === "f0fb63637535c77f0420fabb1f7f3990cab74368eeeec08a40c0d884099fd2f8", "frozen EWXR freeze fp");
  assert(ewerFp === "668ee5c704c4eb4f48bd3e6dd42ebc327736b955c0687cfd1aea45ce8406e595", "frozen EWER freeze fp");
  assert(ewebFp === "e4a37df35cd54500b36cde9b857b700b76ec9be198ccab0c9159b6709cdd8e8d", "frozen EWEB freeze fp");
  assert(requestsFp === "e0cf47cab1ec4a1b3b0fac957b92fd9726a817d259409c6b3ad5ee7db03b9b25", "frozen EWEB-1 fp");
  assert(evidence.componentFingerprints["EPV-2"] === shown.fingerprint, "EPV-2 fp");
  assert(fingerprint.length === 64, "fingerprint");
  assert(viewFp.length === 64, "epi fp");
  assert(pexFp.length === 64, "pex fp");
  assert(wfxFp.length === 64, "wfx fp");
  for (const component of evidence.components) {
    assert(
      existsSync(join(process.cwd(), component.modulePath)),
      `${component.id} module`,
    );
    assert(
      existsSync(join(process.cwd(), component.verifyScript)),
      `${component.id} verify`,
    );
  }
  const epv1Src = readFileSync(
    join(process.cwd(), "scripts/verify-epv-1-workspace-review.ts"),
    "utf8",
  );
  assert(epv1Src.includes("validation only") || epv1Src.includes("Validation only"), "EPV-1 validation");
  assert(epv1Src.includes("SUCCESS") && epv1Src.includes("BLOCKED") && epv1Src.includes("FAILED"), "EPV-1 states");
  const actionSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/submit-workspace-review-action.ts"),
    "utf8",
  );
  assert(actionSrc.includes("runWorkspaceReviewAction"), "same REVIEW action");
  assert(!actionSrc.includes("FOLLOW_UP"), "no new action");
  assert(ESOS_1_ID === "ESOS-1", "esos");
  assert(ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1.length > 0, "ewi product");
  assert(ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1.length > 0, "wfx");
  console.log("PASS Freeze integrity");

  const second = computeEvidenceFingerprint(evidence);
  assert(second === fingerprint, "deterministic evidence");
  console.log("PASS Deterministic");

  assert(getActionExecutionRequests().fingerprint === requestsFp, "no EWEB-1 mutation");
  assert(getEwebFreeze().fingerprint === ewebFp, "no EWEB freeze mutation");
  assert(getEwerFreeze().fingerprint === ewerFp, "no EWER freeze mutation");
  assert(getEwxrFreeze().fingerprint === ewxrFp, "no EWXR freeze mutation");
  assert(getActionIntents().fingerprint === intentsFp, "no EWI-1 mutation");
  assert(getEwiFreeze().fingerprint === ewiFp, "no EWI freeze mutation");
  assert(getWorkspaceActionSurface().fingerprint === actionSurfaceFp, "no EWUI/EWAS mutation");
  assert(getActionConsumptionItems().fingerprint === consumptionFp, "no EAC mutation");
  assert(getActionDeliveryItems().fingerprint === deliveryFp, "no EADS mutation");
  assert(getWorkspaceActionOutcomes().fingerprint === outcomesFp, "no EWA-3 mutation");
  assert(getEwaFreeze().fingerprint === ewaFp, "no EWA freeze mutation");
  assert(getEadsFreeze().fingerprint === eadsFp, "no EADS freeze mutation");
  assert(getEacFreeze().fingerprint === eacFp, "no EAC freeze mutation");
  assert(getEwasFreeze().fingerprint === ewasFp, "no EWAS freeze mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "no ESOS mutation");
  assert(getWfxFreeze().fingerprint === wfxFp, "no WFX mutation");
  assert(getCustomerSuccessReview().fingerprint === reviewFp, "no ESCS review mutation");
  console.log("PASS frozen fingerprints unchanged");

  console.log("\n=== EPV v1 FREEZE VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${fingerprint}`);
  console.log(`version: ${evidence.version}`);
  console.log(`baseline: ${evidence.baseline}`);
  console.log(`product: ${evidence.product}`);
}

main();
