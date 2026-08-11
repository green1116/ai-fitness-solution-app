/**
 * ESCS-1 — Customer Success State verification
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
  CUSTOMER_SUCCESS_STATES,
  CUSTOMER_SUCCESS_STATE_CAPABILITY,
  CUSTOMER_SUCCESS_STATE_VERSION,
  ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1,
  ESCL_V1_BASELINE,
  ESCS_1_ID,
  buildCustomerSuccessState,
  clearCustomerSuccessState,
  customerSuccessStateFingerprint,
  customerSuccessStateFromSignals,
  getCustomerSuccessState,
} from "../lib/commercial/customer-success";
import {
  ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1,
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
  console.log("=== ESCS-1 Customer Success State ===\n");

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
  const feedback = buildExecutionFeedback();
  const lifecycle = buildCustomerLifecycleState();
  buildLifecycleTransition();
  buildLifecycleAction();
  const review = buildLifecycleReview();
  const first = buildCustomerSuccessState(review);

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ESCS_1_ID, "ESCS-1 id");
  assert(first.capability === CUSTOMER_SUCCESS_STATE_CAPABILITY, "capability");
  assert(first.version === CUSTOMER_SUCCESS_STATE_VERSION, "version");
  assert(
    first.baselineTag === ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1,
    "baseline",
  );
  assert(first.esclBaseline === ESCL_V1_BASELINE, "ESCL v1 alias");
  assert(
    first.esclBaseline === ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1,
    "ESCL freeze",
  );
  assert(first.parentPack === "ESCL-4", "parent");
  assert(
    first.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "production baseline",
  );
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(
    first.lifecycleReviewFingerprint === review.fingerprint,
    "review fp",
  );
  assert(first.recordCount === review.recordCount, "count");
  assert(
    first.records.every((r, i) => {
      const rec = review.records[i];
      if (!rec) return false;
      const sourceState =
        lifecycle.records.find((s) => s.customerId === rec.customerId)?.state ??
        rec.toState;
      const sourceFeedback =
        feedback.records.find((f) => f.customerId === rec.customerId)
          ?.feedback ?? "CLOSED";
      const mapped = customerSuccessStateFromSignals({
        lifecycleState: sourceState,
        action: rec.action,
        reviewStatus: rec.reviewStatus,
        feedback: sourceFeedback,
      });
      return (
        r.customerId === rec.customerId &&
        r.tenantId === rec.tenantId &&
        r.lifecycleState === sourceState &&
        r.action === rec.action &&
        r.reviewStatus === rec.reviewStatus &&
        r.sourceFeedback === sourceFeedback &&
        r.state === mapped.state &&
        r.reason === mapped.reason &&
        r.fingerprint.length === 64 &&
        r.ordinal === i + 1
      );
    }),
    "record join",
  );
  assert(
    first.records.every((r) =>
      (CUSTOMER_SUCCESS_STATES as readonly string[]).includes(r.state),
    ),
    "states",
  );
  assert(first.riskCount >= 1, "risk present");
  assert(first.scope.noEsclMutation === true, "noEsclMutation");
  assert(first.scope.noEsceMutation === true, "noEsceMutation");
  assert(first.scope.noPersistence === true, "noPersistence");
  assert(first.scope.noRuntimeSideEffects === true, "noRuntimeSideEffects");
  assert(first.fingerprint.length === 64, "fingerprint");
  console.log("PASS Build");

  const second = buildCustomerSuccessState(review);
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    customerSuccessStateFingerprint(second) === first.fingerprint,
    "helper",
  );
  assert(getCustomerSuccessState().fingerprint === first.fingerprint, "cache");
  clearCustomerSuccessState();
  const third = buildCustomerSuccessState();
  assert(third.fingerprint === first.fingerprint, "after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ESCS-1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`esclBaseline: ${first.esclBaseline}`);
}

main();
