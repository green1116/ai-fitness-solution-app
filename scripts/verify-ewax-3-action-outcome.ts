/**
 * EWA-3 — Action Outcome Signal verification
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
import {
  EWA_2_ID,
  EWA_3_ID,
  EWA2_ACTION_CONTEXT_BASELINE,
  WORKSPACE_ACTION_OUTCOME_VERSION,
  WORKSPACE_ACTION_OUTCOMES,
  buildWorkspaceActionContexts,
  buildWorkspaceActionOutcomes,
  buildWorkspaceActions,
  clearWorkspaceActionContexts,
  clearWorkspaceActionOutcomes,
  clearWorkspaceActions,
  getWorkspaceActionContexts,
  getWorkspaceActionOutcomes,
  getWorkspaceActions,
} from "../lib/commercial/workspace-action";
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
  console.log("=== EWA-3 Action Outcome Signal ===\n");

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
  const outcomes = buildOperatingOutcome(decisions);
  const feedback = buildOperatingFeedback(outcomes);
  const freeze = buildEspoFreeze();
  const freezeFp = freeze.fingerprint;
  const surface = buildOperationsSurface();
  const surfaceFp = surface.fingerprint;
  const view = buildProductIntelligenceView();
  const viewFp = view.fingerprint;
  buildEpiFreeze();
  buildPexFreeze();
  const wfx = buildWfxFreeze();
  const wfxFp = wfx.fingerprint;
  const actions = buildWorkspaceActions();
  const actionsFp = actions.fingerprint;
  const contexts = buildWorkspaceActionContexts();
  const contextsFp = contexts.fingerprint;
  const first = buildWorkspaceActionOutcomes();

  assert(first.workPackageId === EWA_3_ID, "id");
  assert(first.baselineTag === EWA2_ACTION_CONTEXT_BASELINE, "baseline");
  assert(first.parentPack === EWA_2_ID, "parent");
  assert(first.parentVersion === contexts.version, "parent version");
  assert(first.version === WORKSPACE_ACTION_OUTCOME_VERSION, "version");
  assert(first.recordCount === contexts.recordCount, "record count");
  assert(first.workspaceActionFingerprint === actionsFp, "EWA-1 fp");
  assert(first.actionContextFingerprint === contextsFp, "EWA-2 fp");
  assert(first.escalateCount === contexts.complianceCount, "escalate");
  assert(first.readyCount === contexts.deliveryCount, "ready");
  assert(first.watchCount === contexts.observabilityCount, "watch");
  assert(first.holdCount === contexts.deferredCount, "hold");
  assert(
    first.records.every((r) =>
      (WORKSPACE_ACTION_OUTCOMES as readonly string[]).includes(r.outcome),
    ),
    "outcome enum",
  );
  assert(
    first.records.every((r) => {
      const ctx = contexts.records.find((c) => c.id === r.contextId);
      const action = actions.records.find((a) => a.id === r.actionId);
      return (
        ctx !== undefined &&
        action !== undefined &&
        r.customerId === ctx.customerId &&
        r.actionType === ctx.actionType &&
        r.status === ctx.status &&
        r.context === ctx.context &&
        r.priority === ctx.priority &&
        r.reason.startsWith("outcome-")
      );
    }),
    "stable mapping",
  );
  for (let i = 1; i < first.records.length; i += 1) {
    const prev = first.records[i - 1]!;
    const cur = first.records[i]!;
    const rank = { ESCALATE: 0, READY: 1, WATCH: 2, HOLD: 3 } as const;
    assert(
      rank[prev.outcome] < rank[cur.outcome] ||
        (rank[prev.outcome] === rank[cur.outcome] &&
          prev.customerId <= cur.customerId),
      "stable order",
    );
  }
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noPersistence === true, "noPersistence");
  assert(first.scope.noExecution === true, "noExecution");
  assert(first.scope.noPrisma === true, "noPrisma");
  assert(first.scope.noFrozenLayerChanges === true, "noFrozenLayerChanges");
  assert(first.fingerprint.length === 64, "fingerprint");
  assert(getWorkspaceActions().fingerprint === actionsFp, "no EWA-1 mutation");
  assert(getWorkspaceActionContexts().fingerprint === contextsFp, "no EWA-2 mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "no ESOS mutation");
  assert(getWfxFreeze().fingerprint === wfxFp, "no WFX mutation");
  console.log("PASS Build");

  const second = buildWorkspaceActionOutcomes();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(getWorkspaceActionOutcomes().fingerprint === first.fingerprint, "cache");
  const mutated = getWorkspaceActionOutcomes();
  (mutated as { escalateCount: number }).escalateCount = -1;
  assert(
    getWorkspaceActionOutcomes().escalateCount === first.escalateCount,
    "clone-on-get",
  );
  clearWorkspaceActionOutcomes();
  const third = buildWorkspaceActionOutcomes();
  assert(third.fingerprint === first.fingerprint, "after clear");
  assert(getWorkspaceActions().fingerprint === actionsFp, "still no EWA-1 mutation");
  assert(getWorkspaceActionContexts().fingerprint === contextsFp, "still no EWA-2 mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "still no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "still no ESOS mutation");
  console.log("PASS Deterministic");

  console.log("\n=== EWA-3 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`records: ${first.recordCount}`);
}

main();
