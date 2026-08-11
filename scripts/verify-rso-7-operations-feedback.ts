/**
 * RSO-7 — Operations Feedback verification
 */
import {
  APPLICATION_RELEASE_FEEDBACK_CAPABILITY,
  APPLICATION_RELEASE_FEEDBACK_VERSION,
  ARL_6_ID,
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
  ADOPTION_HEALTH_CAPABILITY,
  ADOPTION_HEALTH_VERSION,
  PG_2_2_ID,
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
  GA_RELEASE_VERSION,
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
  COMMERCIAL_HEALTH_CAPABILITY,
  COMMERCIAL_HEALTH_VERSION,
  PG_3_2_ID,
  buildCommercialHealth,
  clearCommercialHealth,
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
  OPERATIONS_FEEDBACK_CAPABILITY,
  OPERATIONS_FEEDBACK_CHANNELS,
  OPERATIONS_FEEDBACK_VERSION,
  RSO6_SERVICE_RELIABILITY_BASELINE,
  RSO_7_ID,
  buildOperationsFeedback,
  clearOperationsFeedback,
  getOperationsFeedback,
  operationsFeedbackFingerprint,
} from "../lib/runtime/feedback";
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
  RSO5_TENANT_OPERATIONS_BASELINE,
  RSO_6_ID,
  SERVICE_RELIABILITY_CAPABILITY,
  SERVICE_RELIABILITY_VERSION,
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
  console.log("=== RSO-7 Operations Feedback ===\n");

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
  clearCommercialHealth();
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
  const adoption = buildAdoptionHealth();
  buildCustomerActivityEvidence();
  buildPg2FreezeManifest();
  buildRevenueLifecycleRegistry();
  const commercial = buildCommercialHealth();
  buildGrowthEvidence();
  buildPg3FreezeManifest();
  buildApplicationReleaseChange();
  buildApplicationReleaseCandidate();
  buildApplicationReleaseVerification();
  buildApplicationDeploymentEvidence();
  buildApplicationProductionRelease();
  const releaseFeedback = buildApplicationReleaseFeedback();

  buildRuntimeHealth();
  buildApplicationMonitoring();
  buildRuntimeIncidents();
  buildRecoveryWorkflow();
  buildTenantOperations();
  const reliability = buildServiceReliability();
  const first = buildOperationsFeedback();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RSO_7_ID, "RSO-7 id");
  assert(first.capability === OPERATIONS_FEEDBACK_CAPABILITY, "capability");
  assert(first.version === OPERATIONS_FEEDBACK_VERSION, "version");
  assert(first.parentPack === RSO_6_ID, "parent pack");
  assert(
    first.serviceReliabilityFingerprint === reliability.fingerprint,
    "RSO-6 reuse fingerprint",
  );
  assert(first.reliabilityStatus === reliability.status, "reliability status");
  assert(
    first.itemCount === reliability.metricCount,
    "item count matches metrics",
  );
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.noNewGovernance === true, "noNewGovernance");
  assert(first.scope.noArlV2 === true, "noArlV2");
  assert(first.scope.noExternalIntegration === true, "noExternalIntegration");
  console.log("PASS RSO-6 reuse");

  assert(
    first.links.length === OPERATIONS_FEEDBACK_CHANNELS.length,
    "link count",
  );
  assert(
    first.links.map((l) => l.channel).join(",") ===
      OPERATIONS_FEEDBACK_CHANNELS.join(","),
    "link channel order",
  );
  const reliabilityLink = first.links.find(
    (l) => l.channel === "SERVICE_RELIABILITY",
  );
  const adoptionLink = first.links.find(
    (l) => l.channel === "CUSTOMER_ADOPTION",
  );
  const commercialLink = first.links.find(
    (l) => l.channel === "COMMERCIAL_GROWTH",
  );
  const releaseLink = first.links.find((l) => l.channel === "RELEASE_FEEDBACK");
  assert(reliabilityLink?.sourcePack === RSO_6_ID, "reliability pack");
  assert(
    reliabilityLink?.sourceCapability === SERVICE_RELIABILITY_CAPABILITY,
    "reliability capability",
  );
  assert(
    reliabilityLink?.sourceVersion === SERVICE_RELIABILITY_VERSION,
    "reliability version",
  );
  assert(
    reliabilityLink?.sourceFingerprint === reliability.fingerprint,
    "reliability fp link",
  );
  assert(adoptionLink?.sourcePack === PG_2_2_ID, "PG-2.2 pack");
  assert(
    adoptionLink?.sourceCapability === ADOPTION_HEALTH_CAPABILITY,
    "adoption capability",
  );
  assert(
    adoptionLink?.sourceVersion === ADOPTION_HEALTH_VERSION,
    "adoption version",
  );
  assert(
    adoptionLink?.sourceFingerprint === adoption.fingerprint,
    "adoption fp link",
  );
  assert(commercialLink?.sourcePack === PG_3_2_ID, "PG-3.2 pack");
  assert(
    commercialLink?.sourceCapability === COMMERCIAL_HEALTH_CAPABILITY,
    "commercial capability",
  );
  assert(
    commercialLink?.sourceVersion === COMMERCIAL_HEALTH_VERSION,
    "commercial version",
  );
  assert(
    commercialLink?.sourceFingerprint === commercial.fingerprint,
    "commercial fp link",
  );
  assert(releaseLink?.sourcePack === ARL_6_ID, "ARL-6 pack");
  assert(
    releaseLink?.sourceCapability === APPLICATION_RELEASE_FEEDBACK_CAPABILITY,
    "release feedback capability",
  );
  assert(
    releaseLink?.sourceVersion === APPLICATION_RELEASE_FEEDBACK_VERSION,
    "release feedback version",
  );
  assert(
    releaseLink?.sourceFingerprint === releaseFeedback.fingerprint,
    "release feedback fp link",
  );
  console.log("PASS PG/ARL linkage");

  assert(
    first.items.map((i) => i.sourceMetricId).join(",") ===
      reliability.metrics.map((m) => m.metricId).join(","),
    "source metric order",
  );
  assert(
    first.items.map((i) => i.sourceCheckId).join(",") ===
      reliability.metrics.map((m) => m.sourceCheckId).join(","),
    "source check order",
  );
  assert(
    first.items.every((i, idx) => i.ordinal === idx + 1),
    "contiguous ordinals",
  );
  assert(first.closedCount === first.itemCount, "all CLOSED when healthy");
  assert(first.status === "CLOSED", "surface CLOSED");
  console.log("PASS Ordering");

  assert(
    first.baselineTag === RSO6_SERVICE_RELIABILITY_BASELINE,
    "pack baseline",
  );
  assert(
    first.baselineTag === "rso6-service-reliability-v1",
    "pack baseline literal",
  );
  assert(
    first.parentBaseline === RSO5_TENANT_OPERATIONS_BASELINE,
    "parent baseline",
  );
  assert(
    first.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "production baseline",
  );
  assert(
    first.productionBaseline === "post-ga-production-baseline-v1",
    "post-ga baseline trace",
  );
  console.log("PASS Baseline trace");

  const second = buildOperationsFeedback();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    operationsFeedbackFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getOperationsFeedback().fingerprint === first.fingerprint,
    "get cache",
  );

  clearOperationsFeedback();
  const third = buildOperationsFeedback();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== RSO-7 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`parentBaseline: ${first.parentBaseline}`);
  console.log(`productionBaseline: ${first.productionBaseline}`);
  console.log(`feedbackStatus: ${first.status}`);
}

main();
