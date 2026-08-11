/**
 * ESCI-1 — Customer Intelligence State verification
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
  CUSTOMER_INTELLIGENCE_STATES,
  CUSTOMER_INTELLIGENCE_STATE_CAPABILITY,
  CUSTOMER_INTELLIGENCE_STATE_VERSION,
  ESCA_V1_BASELINE,
  ESCI_1_ID,
  buildCustomerIntelligenceState,
  clearCustomerIntelligenceState,
  customerIntelligenceStateFingerprint,
  customerIntelligenceStateFromSignals,
  getCustomerIntelligenceState,
} from "../lib/commercial/intelligence";
import {
  ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1,
  buildAdvocacyActionSignal,
  buildAdvocacyReadiness,
  buildAdvocacyState,
  buildEscaFreeze,
  clearAdvocacyActionSignal,
  clearAdvocacyReadiness,
  clearAdvocacyState,
  clearEscaFreeze,
  getEscaFreeze,
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
  getRenewalState,
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
  getExpansionState,
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
  getRetentionState,
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
  getCustomerSuccessState,
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
  console.log("=== ESCI-1 Customer Intelligence State ===\n");

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
  const freeze = buildEscaFreeze();
  const freezeFp = freeze.fingerprint;
  const success = getCustomerSuccessState();
  const retention = getRetentionState();
  const expansion = getExpansionState();
  const renewal = getRenewalState();
  const advocacy = buildAdvocacyState();
  const first = buildCustomerIntelligenceState(advocacy);

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ESCI_1_ID, "ESCI-1 id");
  assert(
    first.capability === CUSTOMER_INTELLIGENCE_STATE_CAPABILITY,
    "capability",
  );
  assert(first.version === CUSTOMER_INTELLIGENCE_STATE_VERSION, "version");
  assert(
    first.baselineTag === ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1,
    "baseline",
  );
  assert(first.escaBaseline === ESCA_V1_BASELINE, "ESCA v1 alias");
  assert(
    first.escaBaseline === ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1,
    "ESCA freeze",
  );
  assert(first.parentPack === "ESCA-Freeze", "parent");
  assert(
    first.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "production baseline",
  );
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(
    first.advocacyStateFingerprint === advocacy.fingerprint,
    "advocacy fp",
  );
  assert(first.escaFreezeFingerprint === freeze.fingerprint, "freeze fp");
  assert(getEscaFreeze().fingerprint === freezeFp, "no ESCA freeze mutation");
  assert(first.recordCount === advocacy.recordCount, "count");
  assert(
    first.records.every((r, i) => {
      const rec = advocacy.records[i];
      if (!rec) return false;
      const successState =
        success.records.find((s) => s.customerId === rec.customerId)?.state ??
        "HEALTHY";
      const retentionState =
        retention.records.find((s) => s.customerId === rec.customerId)?.state ??
        "SECURE";
      const expansionState =
        expansion.records.find((s) => s.customerId === rec.customerId)?.state ??
        "READY";
      const renewalState =
        renewal.records.find((s) => s.customerId === rec.customerId)?.state ??
        "READY";
      const mapped = customerIntelligenceStateFromSignals({
        successState,
        retentionState,
        expansionState,
        renewalState,
        advocacyState: rec.state,
      });
      return (
        r.customerId === rec.customerId &&
        r.tenantId === rec.tenantId &&
        r.successState === successState &&
        r.retentionState === retentionState &&
        r.expansionState === expansionState &&
        r.renewalState === renewalState &&
        r.advocacyState === rec.state &&
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
      (CUSTOMER_INTELLIGENCE_STATES as readonly string[]).includes(r.state),
    ),
    "states",
  );
  assert(first.riskCount >= advocacy.blockedCount, "BLOCKED→risk");
  assert(first.riskCount >= 1, "risk present");
  assert(first.scope.noEscaMutation === true, "noEscaMutation");
  assert(first.scope.noMarketingExecution === true, "noMarketingExecution");
  assert(first.scope.noPersistence === true, "noPersistence");
  assert(first.scope.noRuntimeSideEffects === true, "noRuntimeSideEffects");
  assert(first.fingerprint.length === 64, "fingerprint");
  console.log("PASS Build");

  const second = buildCustomerIntelligenceState(advocacy);
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    customerIntelligenceStateFingerprint(second) === first.fingerprint,
    "helper",
  );
  assert(
    getCustomerIntelligenceState().fingerprint === first.fingerprint,
    "cache",
  );
  const mutated = getCustomerIntelligenceState();
  (mutated as { riskCount: number }).riskCount = -1;
  assert(
    getCustomerIntelligenceState().riskCount === first.riskCount,
    "clone-on-get",
  );
  clearCustomerIntelligenceState();
  const third = buildCustomerIntelligenceState();
  assert(third.fingerprint === first.fingerprint, "after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ESCI-1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`escaBaseline: ${first.escaBaseline}`);
}

main();
