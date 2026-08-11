/**
 * ESCP-3 — Customer Plan Portfolio verification
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
  GA_RELEASE_BASELINE,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  POST_GA_PRODUCTION_BASELINE,
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
  RELEASE_ID,
  buildReleaseReadiness,
  clearReleaseReadiness,
} from "../lib/release/release-readiness";
import {
  CUSTOMER_PLAN_ACTION_VERSION,
  CUSTOMER_PLAN_PORTFOLIO_CAPABILITY,
  CUSTOMER_PLAN_PORTFOLIO_ID,
  CUSTOMER_PLAN_PORTFOLIO_VERSION,
  ESCP2_CUSTOMER_PLAN_ACTION_BASELINE,
  ESCP_3_ID,
  buildCustomerPlanAction,
  buildCustomerPlanPortfolio,
  buildCustomerPlanState,
  clearCustomerPlanAction,
  clearCustomerPlanPortfolio,
  clearCustomerPlanState,
  customerPlanPortfolioFingerprint,
  getCustomerPlanPortfolio,
  portfolioPlanFromCounts,
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
  console.log("=== ESCP-3 Customer Plan Portfolio ===\n");

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
  const state = buildCustomerPlanState();
  const action = buildCustomerPlanAction(state);
  const first = buildCustomerPlanPortfolio(action);

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ESCP_3_ID, "ESCP-3 id");
  assert(
    first.capability === CUSTOMER_PLAN_PORTFOLIO_CAPABILITY,
    "capability",
  );
  assert(first.version === CUSTOMER_PLAN_PORTFOLIO_VERSION, "version");
  assert(first.baselineTag === ESCP2_CUSTOMER_PLAN_ACTION_BASELINE, "baseline");
  assert(first.parentPack === "ESCP-2", "parent");
  assert(
    first.parentVersion === CUSTOMER_PLAN_ACTION_VERSION,
    "parent version",
  );
  assert(first.parentVersion === "escp-2-customer-plan-action-1", "BASE");
  assert(first.portfolioId === CUSTOMER_PLAN_PORTFOLIO_ID, "portfolio id");
  assert(
    first.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "production baseline",
  );
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(
    first.customerPlanActionFingerprint === action.fingerprint,
    "action fp",
  );
  assert(
    first.customerPlanStateFingerprint === state.fingerprint,
    "state fp",
  );
  assert(first.recordCount === action.recordCount, "count");
  assert(first.recordCount === state.recordCount, "state count");
  assert(first.customerCount === first.recordCount, "customer count");
  assert(first.actionCount === action.recordCount, "action count");
  assert(
    first.records.every((r, i) => {
      const rec = action.records[i];
      const src = state.records[i];
      if (!rec || !src) return false;
      return (
        r.portfolioRecordId === `escp-3:${rec.tenantId}:${rec.customerId}` &&
        r.planId === rec.planId &&
        r.actionId === rec.actionId &&
        r.customerId === rec.customerId &&
        r.customerId === src.customerId &&
        r.tenantId === rec.tenantId &&
        r.status === src.status &&
        r.action === rec.action &&
        r.priority === rec.priority &&
        r.focus === src.focus &&
        r.reason === rec.reason &&
        r.fingerprint.length === 64 &&
        r.ordinal === i + 1
      );
    }),
    "portfolio join",
  );
  assert(first.blockedCount === state.blockedCount, "blocked count");
  assert(first.planningCount === state.planningCount, "planning count");
  assert(first.readyCount === state.readyCount, "ready count");
  assert(first.notReadyCount === state.notReadyCount, "not-ready count");
  assert(first.remediateCount === action.remediateCount, "remediate count");
  assert(first.prepareCount === action.prepareCount, "prepare count");
  assert(first.holdCount === action.holdCount, "hold count");
  assert(first.watchCount === action.watchCount, "watch count");
  assert(first.prioritySummary.p1Count === first.blockedCount, "p1 summary");
  assert(first.prioritySummary.p2Count === first.planningCount, "p2 summary");
  assert(first.prioritySummary.p3Count === first.notReadyCount, "p3 summary");
  assert(first.prioritySummary.p4Count === first.readyCount, "p4 summary");
  assert(
    first.focusSummary.remediationCount === first.blockedCount,
    "remediation summary",
  );
  assert(first.focusSummary.growthCount === first.planningCount, "growth summary");
  assert(
    first.focusSummary.stabilityCount === first.readyCount,
    "stability summary",
  );
  assert(first.focusSummary.monitorCount === first.notReadyCount, "monitor summary");
  const rolled = portfolioPlanFromCounts({
    blockedCount: first.blockedCount,
    planningCount: first.planningCount,
    readyCount: first.readyCount,
  });
  assert(first.portfolioStatus === rolled.portfolioStatus, "portfolio status");
  assert(first.portfolioAction === rolled.portfolioAction, "portfolio action");
  assert(
    first.portfolioPriority === rolled.portfolioPriority,
    "portfolio priority",
  );
  assert(first.portfolioFocus === rolled.portfolioFocus, "portfolio focus");
  assert(first.prioritySummary.dominant === first.portfolioPriority, "dominant p");
  assert(first.focusSummary.dominant === first.portfolioFocus, "dominant focus");
  assert(first.blockedCount >= 1, "blocked present");
  assert(first.portfolioStatus === "BLOCKED", "portfolio blocked");
  assert(first.portfolioAction === "REMEDIATE", "portfolio remediate");
  assert(first.scope.recommendationOnly === true, "recommendationOnly");
  assert(first.scope.planningOnly === true, "planningOnly");
  assert(first.scope.noExecution === true, "noExecution");
  assert(first.scope.noPersistence === true, "noPersistence");
  assert(first.scope.noRuntimeSideEffects === true, "noRuntimeSideEffects");
  assert(first.fingerprint.length === 64, "fingerprint");
  console.log("PASS Build");

  const second = buildCustomerPlanPortfolio(action);
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    customerPlanPortfolioFingerprint(second) === first.fingerprint,
    "helper",
  );
  assert(getCustomerPlanPortfolio().fingerprint === first.fingerprint, "cache");
  const mutated = getCustomerPlanPortfolio();
  (mutated as { blockedCount: number }).blockedCount = -1;
  assert(
    getCustomerPlanPortfolio().blockedCount === first.blockedCount,
    "clone-on-get",
  );
  clearCustomerPlanPortfolio();
  const third = buildCustomerPlanPortfolio();
  assert(third.fingerprint === first.fingerprint, "after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ESCP-3 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`parentVersion: ${first.parentVersion}`);
  console.log(`portfolioStatus: ${first.portfolioStatus}`);
  console.log(`portfolioAction: ${first.portfolioAction}`);
}

main();
