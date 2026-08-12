/**
 * ESOS v1 Freeze — Operations Surface evidence verification
 * Evidence only — no new engine / abstraction / frozen-layer mutation.
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
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
import * as surfaceRoute from "../app/api/operations/surface/route";
import {
  ESOS_1_ID,
  ESPO_V1_BASELINE,
  OPERATIONS_SURFACE_CAPABILITY,
  OPERATIONS_SURFACE_VERSION,
  buildOperationsSurface,
  clearOperationsSurface,
  getOperationsSurface,
  operationsSurfaceFingerprint,
} from "../lib/commercial/operations-surface";
import {
  ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1,
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

async function main() {
  console.log("=== ESOS v1 Freeze Gate ===\n");

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
  const first = buildOperationsSurface();
  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ESOS_1_ID, "ESOS-1 id");
  assert(first.capability === OPERATIONS_SURFACE_CAPABILITY, "capability");
  assert(first.version === OPERATIONS_SURFACE_VERSION, "version");
  assert(
    first.baselineTag === ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1,
    "baseline",
  );
  assert(first.espoBaseline === ESPO_V1_BASELINE, "ESPO v1 alias");
  assert(first.parentPack === "ESPO-Freeze", "parent");
  assert(first.parentVersion === "espo-freeze-1.0.0", "parent version");
  assert(
    first.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "production baseline",
  );
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.operatingQueueFingerprint === queue.fingerprint, "queue fp");
  assert(
    first.operatingDecisionFingerprint === decisions.fingerprint,
    "decision fp",
  );
  assert(
    first.operatingOutcomeFingerprint === outcomes.fingerprint,
    "outcome fp",
  );
  assert(
    first.operatingFeedbackFingerprint === feedback.fingerprint,
    "feedback fp",
  );
  assert(first.espoFreezeFingerprint === freeze.fingerprint, "freeze fp");
  assert(first.queue.length === queue.recordCount, "queue length");
  assert(first.decisions.length === decisions.recordCount, "decision length");
  assert(first.outcomes.length === outcomes.recordCount, "outcome length");
  assert(first.feedback.length === feedback.recordCount, "feedback length");
  assert(first.summary.itemCount === queue.recordCount, "item count");
  assert(first.summary.openCount === queue.openCount, "open count");
  assert(first.summary.queuedCount === queue.queuedCount, "queued count");
  assert(first.summary.watchCount === queue.watchCount, "watch count");
  assert(first.summary.heldCount === queue.heldCount, "held count");
  assert(first.summary.actCount === decisions.actCount, "act count");
  assert(first.summary.recordedCount === outcomes.recordedCount, "recorded");
  assert(first.summary.escalateCount === feedback.escalateCount, "escalate");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.viewOnly === true, "viewOnly");
  assert(first.scope.noEspoMutation === true, "noEspoMutation");
  assert(first.scope.noExecution === true, "noExecution");
  assert(first.scope.noPersistence === true, "noPersistence");
  assert(first.scope.noRuntimeSideEffects === true, "noRuntimeSideEffects");
  assert(first.fingerprint.length === 64, "fingerprint");
  assert(getEspoFreeze().fingerprint === freezeFp, "no ESPO freeze mutation");
  console.log("PASS ESOS-1 surface contract");

  assert(typeof surfaceRoute.GET === "function", "ESOS-2 GET");
  assert(
    typeof (surfaceRoute as { POST?: unknown }).POST === "undefined",
    "ESOS-2 no POST",
  );
  const routePath = join(process.cwd(), "app/api/operations/surface/route.ts");
  assert(existsSync(routePath), "ESOS-2 route file");
  const routeSrc = readFileSync(routePath, "utf8");
  assert(routeSrc.includes("getOperationsSurface"), "reuses ESOS-1");
  assert(!/export async function POST/.test(routeSrc), "route no POST");
  const response = await surfaceRoute.GET();
  assert(response.status === 200, "GET status");
  const body = (await response.json()) as ReturnType<typeof getOperationsSurface>;
  assert(body.fingerprint === first.fingerprint, "API fingerprint");
  assert(body.workPackageId === ESOS_1_ID, "API id");
  assert(body.queue.length === first.queue.length, "API queue");
  assert(body.decisions.length === first.decisions.length, "API decisions");
  assert(body.outcomes.length === first.outcomes.length, "API outcomes");
  assert(body.feedback.length === first.feedback.length, "API feedback");
  assert(getEspoFreeze().fingerprint === freezeFp, "GET no ESPO mutation");
  console.log("PASS ESOS-2 API availability");

  const pagePath = join(
    process.cwd(),
    "app/(dashboard)/operations/page.tsx",
  );
  assert(existsSync(pagePath), "ESOS-3 page file");
  const pageSrc = readFileSync(pagePath, "utf8");
  assert(
    pageSrc.includes("@/app/api/operations/surface/route"),
    "page consumes ESOS-2",
  );
  assert(pageSrc.includes("/api/operations/surface"), "page surface API");
  assert(pageSrc.includes("summary.itemCount"), "queue summary");
  assert(pageSrc.includes("summary.openCount"), "open");
  assert(pageSrc.includes("summary.queuedCount"), "queued");
  assert(pageSrc.includes("summary.watchCount"), "watch");
  assert(pageSrc.includes("summary.heldCount"), "held");
  assert(pageSrc.includes("summary.actCount"), "decision summary");
  assert(pageSrc.includes("summary.recordedCount"), "outcome summary");
  assert(pageSrc.includes("summary.escalateCount"), "feedback summary");
  assert(!/<form/i.test(pageSrc), "page no form");
  assert(!/method:\s*["']POST["']/.test(pageSrc), "page no POST action");
  console.log("PASS ESOS-3 application consumption");

  const rebuilt = buildOperationsSurface();
  assert(rebuilt.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    operationsSurfaceFingerprint(rebuilt) === first.fingerprint,
    "helper",
  );
  const secondGet = await surfaceRoute.GET();
  const secondBody = (await secondGet.json()) as ReturnType<
    typeof getOperationsSurface
  >;
  assert(secondBody.fingerprint === first.fingerprint, "deterministic GET");
  clearOperationsSurface();
  const afterClear = buildOperationsSurface();
  assert(afterClear.fingerprint === first.fingerprint, "after clear");
  assert(getEspoFreeze().fingerprint === freezeFp, "still no ESPO mutation");
  console.log("PASS Deterministic / read-only");

  console.log("\n=== ESOS v1 FREEZE VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`endpoint: GET /api/operations/surface`);
  console.log(`ui: /operations`);
}

void main();
