/**
 * ESCO-1 — Commercial Operations Foundation verification
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
  ARL_4_ID,
  buildApplicationDeploymentEvidence,
  clearApplicationDeploymentEvidence,
  getApplicationDeploymentEvidence,
} from "../lib/release/application/deployment";
import {
  ARL_5_ID,
  buildApplicationProductionRelease,
  clearApplicationProductionRelease,
  getApplicationProductionRelease,
} from "../lib/release/application/production-release";
import {
  buildApplicationReleaseVerification,
  clearApplicationReleaseVerification,
} from "../lib/release/application/verification";
import {
  PG_2_2_ID,
  buildAdoptionHealth,
  clearAdoptionHealth,
  getAdoptionHealth,
} from "../lib/release/customer/adoption-health";
import {
  buildCustomerActivityEvidence,
  clearCustomerActivityEvidence,
} from "../lib/release/customer/customer-activity-evidence";
import {
  PG_2_1_ID,
  buildCustomerLifecycleRegistry,
  clearCustomerLifecycleRegistry,
  getCustomerLifecycleRegistry,
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
  PG_3_2_ID,
  buildCommercialHealth,
  clearCommercialHealth,
  getCommercialHealth,
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
  COMMERCIAL_OPERATIONS_CAPABILITY,
  COMMERCIAL_OPERATIONS_STAGES,
  COMMERCIAL_OPERATIONS_VERSION,
  ESCO_1_ID,
  ESRO_V1_BASELINE,
  buildCommercialOperations,
  clearCommercialOperations,
  commercialOperationsFingerprint,
  getCommercialOperations,
} from "../lib/commercial/operations";
import {
  buildOperationsFeedback,
  clearOperationsFeedback,
} from "../lib/runtime/feedback";
import {
  ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
  RSO_8_ID,
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
  RSO_5_ID,
  buildTenantOperations,
  clearTenantOperations,
  getTenantOperations,
} from "../lib/runtime/tenant";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== ESCO-1 Commercial Operations Foundation ===\n");

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
  buildAdoptionHealth();
  buildCustomerActivityEvidence();
  buildPg2FreezeManifest();
  buildRevenueLifecycleRegistry();
  buildCommercialHealth();
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
  const esro = buildRuntimeOperationsFreeze();

  const customer = getCustomerLifecycleRegistry();
  const tenant = getTenantOperations();
  const production = getApplicationProductionRelease();
  const delivery = getApplicationDeploymentEvidence();
  const adoption = getAdoptionHealth();
  const commercial = getCommercialHealth();

  const first = buildCommercialOperations();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ESCO_1_ID, "ESCO-1 id");
  assert(first.capability === COMMERCIAL_OPERATIONS_CAPABILITY, "capability");
  assert(first.version === COMMERCIAL_OPERATIONS_VERSION, "version");
  assert(first.baselineTag === ESRO_V1_BASELINE, "baseline");
  assert(
    first.baselineTag === ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
    "ESRO v1",
  );
  assert(
    first.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "production baseline",
  );
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.esroPack === RSO_8_ID, "esro pack");
  assert(first.esroFingerprint === esro.fingerprint, "esro fp");
  assert(first.status === "READY", "READY");
  assert(first.linkCount === COMMERCIAL_OPERATIONS_STAGES.length, "link count");
  assert(
    first.links.map((l) => l.stage).join(",") ===
      COMMERCIAL_OPERATIONS_STAGES.join(","),
    "stage order",
  );
  assert(first.links[0]?.sourcePack === PG_2_1_ID, "customer");
  assert(first.links[0]?.sourceFingerprint === customer.fingerprint, "cust fp");
  assert(first.links[1]?.sourcePack === RSO_5_ID, "tenant");
  assert(first.links[1]?.sourceFingerprint === tenant.fingerprint, "tenant fp");
  assert(first.links[2]?.sourcePack === ARL_5_ID, "production");
  assert(
    first.links[2]?.sourceFingerprint === production.fingerprint,
    "prod fp",
  );
  assert(first.links[3]?.sourcePack === ARL_4_ID, "delivery");
  assert(
    first.links[3]?.sourceFingerprint === delivery.fingerprint,
    "delivery fp",
  );
  assert(first.links[4]?.sourcePack === PG_2_2_ID, "adoption");
  assert(
    first.links[4]?.sourceFingerprint === adoption.fingerprint,
    "adoption fp",
  );
  assert(first.links[5]?.sourcePack === PG_3_2_ID, "commercial");
  assert(
    first.links[5]?.sourceFingerprint === commercial.fingerprint,
    "commercial fp",
  );
  assert(first.scope.noCrmPlatform === true, "noCrm");
  assert(first.scope.noBillingPlatform === true, "noBilling");
  assert(first.scope.noArlV2 === true, "noArlV2");
  assert(first.scope.noRso9 === true, "noRso9");
  console.log("PASS Build");

  const second = buildCommercialOperations();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    commercialOperationsFingerprint(second) === first.fingerprint,
    "helper",
  );
  assert(getCommercialOperations().fingerprint === first.fingerprint, "cache");
  clearCommercialOperations();
  const third = buildCommercialOperations();
  assert(third.fingerprint === first.fingerprint, "after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ESCO-1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
