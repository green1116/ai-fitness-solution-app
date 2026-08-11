/**
 * ESCO-4 — Commercial Operations Review verification
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
  COMMERCIAL_OPERATIONS_REVIEW_CAPABILITY,
  COMMERCIAL_OPERATIONS_REVIEW_VERSION,
  COMMERCIAL_REVIEW_STATUSES,
  ESCO3_COMMERCIAL_ACTION_SIGNAL_BASELINE,
  ESCO_4_ID,
  buildCommercialActionSignal,
  buildCommercialHealth,
  buildCommercialOperations,
  buildCommercialOperationsReview,
  clearCommercialActionSignal,
  clearCommercialHealth,
  clearCommercialOperations,
  clearCommercialOperationsReview,
  commercialOperationsReviewFingerprint,
  commercialReviewStatusFromAction,
  getCommercialOperationsReview,
} from "../lib/commercial/operations";
import {
  buildOperationsFeedback,
  clearOperationsFeedback,
} from "../lib/runtime/feedback";
import {
  ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
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
  console.log("=== ESCO-4 Commercial Operations Review ===\n");

  clearCommercialOperationsReview();
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
  const signal = buildCommercialActionSignal();
  const first = buildCommercialOperationsReview();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ESCO_4_ID, "ESCO-4 id");
  assert(
    first.capability === COMMERCIAL_OPERATIONS_REVIEW_CAPABILITY,
    "capability",
  );
  assert(first.version === COMMERCIAL_OPERATIONS_REVIEW_VERSION, "version");
  assert(
    first.baselineTag === ESCO3_COMMERCIAL_ACTION_SIGNAL_BASELINE,
    "baseline",
  );
  assert(first.parentPack === "ESCO-3", "parent");
  assert(
    first.productBaseline === ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
    "product",
  );
  assert(
    first.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "production baseline",
  );
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(
    first.commercialActionSignalFingerprint === signal.fingerprint,
    "signal fp",
  );
  assert(first.recordCount === signal.signalCount, "count");
  assert(
    first.records.every((r, i) => {
      const s = signal.signals[i];
      if (!s) return false;
      const mapped = commercialReviewStatusFromAction(s.action);
      return (
        r.customerId === s.customerId &&
        r.tenantId === s.tenantId &&
        r.health === s.sourceHealth &&
        r.action === s.action &&
        r.reviewStatus === mapped.reviewStatus &&
        r.reason === mapped.reason &&
        r.fingerprint.length === 64 &&
        r.ordinal === i + 1
      );
    }),
    "review mapping",
  );
  assert(
    first.records.every((r) =>
      (COMMERCIAL_REVIEW_STATUSES as readonly string[]).includes(r.reviewStatus),
    ),
    "statuses",
  );
  assert(first.actionRequiredCount === signal.escalateCount, "escalate→action");
  assert(first.actionRequiredCount >= 1, "action required present");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noExecution === true, "noExecution");
  assert(first.fingerprint.length === 64, "fingerprint");
  console.log("PASS Build");

  const second = buildCommercialOperationsReview();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    commercialOperationsReviewFingerprint(second) === first.fingerprint,
    "helper",
  );
  assert(
    getCommercialOperationsReview().fingerprint === first.fingerprint,
    "cache",
  );
  clearCommercialOperationsReview();
  const third = buildCommercialOperationsReview();
  assert(third.fingerprint === first.fingerprint, "after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ESCO-4 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
