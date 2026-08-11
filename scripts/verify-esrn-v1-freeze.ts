/**
 * ESRN v1 Freeze — Enterprise SaaS Renewal Operations v1 verification
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
  ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1,
  ESRN_COMPONENTS,
  ESRN_FREEZE_CAPABILITY,
  ESRN_FREEZE_CODENAME,
  ESRN_FREEZE_ID,
  ESRN_FREEZE_VERSION,
  RENEWAL_ACTION_SIGNAL_VERSION,
  RENEWAL_READINESS_VERSION,
  RENEWAL_STATE_VERSION,
  buildEsrnFreeze,
  buildRenewalActionSignal,
  buildRenewalReadiness,
  buildRenewalState,
  clearEsrnFreeze,
  clearRenewalActionSignal,
  clearRenewalReadiness,
  clearRenewalState,
  esrnFreezeFingerprint,
  getEsrnFreeze,
  getRenewalActionSignal,
  renewalActionSignalFromSignals,
  renewalReadinessFromState,
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
  console.log("=== ESRN v1 Freeze ===\n");

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
  const state = buildRenewalState();
  const readiness = buildRenewalReadiness(state);
  const signal = buildRenewalActionSignal(readiness);
  const first = buildEsrnFreeze();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ESRN_FREEZE_ID, "freeze id");
  assert(first.capability === ESRN_FREEZE_CAPABILITY, "capability");
  assert(first.version === ESRN_FREEZE_VERSION, "version");
  assert(first.codename === ESRN_FREEZE_CODENAME, "codename");
  assert(
    first.baselineTag === ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1,
    "product freeze",
  );
  assert(
    first.manifest.signalVersion === RENEWAL_ACTION_SIGNAL_VERSION,
    "signal version",
  );
  assert(
    first.manifest.versionReferences["ESRN-1"] === RENEWAL_STATE_VERSION,
    "ESRN-1 version",
  );
  assert(
    first.manifest.versionReferences["ESRN-2"] === RENEWAL_READINESS_VERSION,
    "ESRN-2 version",
  );
  assert(
    first.manifest.versionReferences["ESRN-3"] === RENEWAL_ACTION_SIGNAL_VERSION,
    "ESRN-3 version",
  );
  assert(
    first.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "production baseline",
  );
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.manifest.components.length === 3, "component count");
  assert(
    first.manifest.components.map((c) => c.id).join(",") ===
      ESRN_COMPONENTS.map((c) => c.id).join(","),
    "chain order",
  );
  assert(
    first.manifest.components.map((c) => c.id).join(",") ===
      "ESRN-1,ESRN-2,ESRN-3",
    "STATE→READINESS→ACTION_SIGNAL",
  );
  assert(
    first.scope.chain === "STATE -> READINESS -> ACTION_SIGNAL -> FROZEN",
    "freeze chain",
  );
  assert(
    first.manifest.components.every((c) => c.status === "frozen"),
    "all frozen",
  );
  assert(
    first.manifest.componentFingerprints["ESRN-1"] === state.fingerprint,
    "ESRN-1 locked",
  );
  assert(
    first.manifest.componentFingerprints["ESRN-2"] === readiness.fingerprint,
    "ESRN-2 locked",
  );
  assert(
    first.manifest.componentFingerprints["ESRN-3"] === signal.fingerprint,
    "ESRN-3 locked",
  );
  assert(first.signalFingerprint === signal.fingerprint, "signal fp");
  assert(readiness.recordCount === state.recordCount, "readiness count");
  assert(signal.recordCount === readiness.recordCount, "signal count");
  assert(
    readiness.records.every((r, i) => {
      const rec = state.records[i];
      if (!rec) return false;
      const mapped = renewalReadinessFromState(rec.state);
      return r.readiness === mapped.readiness;
    }),
    "state→readiness",
  );
  assert(
    signal.records.every((r, i) => {
      const rec = readiness.records[i];
      const src = state.records[i];
      if (!rec || !src) return false;
      const mapped = renewalActionSignalFromSignals({
        state: src.state,
        readiness: rec.readiness,
      });
      return r.action === mapped.action;
    }),
    "state+readiness→signal",
  );
  assert(first.certification === "certified", "certified");
  assert(first.verificationSummary.status === "PASS", "summary PASS");
  assert(first.scope.noEsxpMutation === true, "noEsxpMutation");
  assert(first.scope.noPersistence === true, "noPersistence");
  assert(first.scope.noRuntimeSideEffects === true, "noRuntimeSideEffects");
  assert(first.scope.noContractExecution === true, "noContractExecution");
  assert(first.scope.noPaymentExecution === true, "noPaymentExecution");
  assert(first.fingerprint.length === 64, "fingerprint");
  assert(
    getRenewalActionSignal().fingerprint === first.signalFingerprint,
    "no signal mutation",
  );
  const mutated = getEsrnFreeze();
  (mutated as { certification: string }).certification = "blocked";
  assert(getEsrnFreeze().certification === "certified", "clone-on-get");
  console.log("PASS Freeze integrity");

  const second = buildEsrnFreeze();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(esrnFreezeFingerprint(second) === first.fingerprint, "helper");
  assert(getEsrnFreeze().fingerprint === first.fingerprint, "cache");
  clearEsrnFreeze();
  const third = buildEsrnFreeze();
  assert(third.fingerprint === first.fingerprint, "after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ESRN v1 FREEZE VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`signalVersion: ${first.manifest.signalVersion}`);
  console.log(`certification: ${first.certification}`);
}

main();
