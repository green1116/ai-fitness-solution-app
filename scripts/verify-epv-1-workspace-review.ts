/**
 * EPV-1 — Product Validation for frozen EWXR v1
 * Validation only — no architecture / features / frozen-layer mutation.
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
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  EWXR_1_ID,
  EWXR_FREEZE_ID,
  ENTERPRISE_SAAS_WORKSPACE_REVIEW_ACTION_V1,
  SUPPORTED_CONTROLLED_ACTION_INTENT,
  buildActionExecutionRequests,
  buildEwebFreeze,
  buildEwerFreeze,
  buildEwxrFreeze,
  clearActionExecutionRequests,
  clearEwebFreeze,
  clearEwerFreeze,
  clearEwxrFreeze,
  executeControlledAction,
  getActionExecutionRequests,
  getEwebFreeze,
  getEwerFreeze,
  getEwxrFreeze,
  listWorkspaceReviewSurfaceItemIds,
  runWorkspaceReviewAction,
} from "../lib/commercial/action-execution";
import { submitWorkspaceReviewAction } from "../app/(workspace)/submit-workspace-review-action";
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
  buildWorkspaceActionSurface,
  clearWorkspaceActionSurface,
  getWorkspaceActionSurface,
} from "../lib/workflow/experience/workspace-action-surface";
import {
  ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1,
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
  PEX_INTELLIGENCE_ENDPOINT,
  buildPexFreeze,
  clearPexFreeze,
  getPexFreeze,
  readProductIntelligenceExperience,
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

async function main() {
  console.log("=== EPV-1 Workspace REVIEW Product Validation ===\n");

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
  buildProductIntelligenceView();
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

  const pkg = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf8"),
  ) as { scripts?: Record<string, string> };
  assert(typeof pkg.scripts?.build === "string", "next build script");
  assert(pkg.scripts!.build.includes("next build"), "production next build");
  const tsconfig = readFileSync(
    join(process.cwd(), "tsconfig.release-wp1.json"),
    "utf8",
  );
  assert(tsconfig.includes("WorkspaceActionSurfacePanel.tsx"), "panel in release compile");
  assert(tsconfig.includes("WorkspaceReviewActionControl.tsx"), "REVIEW control in release compile");
  assert(tsconfig.includes("submit-workspace-review-action.ts"), "server action in release compile");
  assert(tsconfig.includes("workspace-review-action.ts"), "EWXR adapter in release compile");
  assert(tsconfig.includes("ewxr-freeze-manifest.ts"), "EWXR freeze in release compile");
  const tsc = spawnSync(
    "npx",
    ["tsc", "-p", "tsconfig.release-wp1.json", "--noEmit"],
    { cwd: process.cwd(), encoding: "utf8", shell: true },
  );
  assert(tsc.status === 0, `production tsc: ${tsc.stderr || tsc.stdout}`);
  console.log("PASS production build");

  const panelSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/WorkspaceActionSurfacePanel.tsx"),
    "utf8",
  );
  const controlSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/WorkspaceReviewActionControl.tsx"),
    "utf8",
  );
  const actionSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/submit-workspace-review-action.ts"),
    "utf8",
  );
  const adapterSrc = readFileSync(
    join(process.cwd(), "lib/commercial/action-execution/workspace-review-action.ts"),
    "utf8",
  );
  const layoutSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/layout.tsx"),
    "utf8",
  );
  assert(panelSrc.includes("readWorkspaceActionSurface"), "surface reader");
  assert(panelSrc.includes("ATTENTION") && panelSrc.includes("AVAILABLE") && panelSrc.includes("DEFERRED"), "REVIEW visibility states");
  assert(panelSrc.includes("listWorkspaceReviewSurfaceItemIds"), "REVIEW visibility filter");
  assert(panelSrc.includes("WorkspaceReviewActionControl"), "REVIEW trigger mounted");
  assert(panelSrc.includes("surface.items"), "items visible");
  const reviewIds = listWorkspaceReviewSurfaceItemIds();
  assert(reviewIds.length > 0, "REVIEW items visible");
  assert(
    reviewIds.every((id) =>
      intents.records.some(
        (row) => row.surfaceItemId === id && row.intent === "REVIEW",
      ),
    ),
    "visibility is REVIEW-only",
  );
  assert(
    intents.records
      .filter((row) => row.intent !== "REVIEW")
      .every((row) => !reviewIds.includes(row.surfaceItemId)),
    "non-REVIEW hidden from trigger",
  );
  console.log("PASS Workspace REVIEW visibility");

  assert(controlSrc.includes(">REVIEW<") || controlSrc.includes("REVIEW"), "REVIEW button");
  assert(!controlSrc.includes("FOLLOW_UP"), "no FOLLOW_UP trigger");
  assert(!controlSrc.includes("MONITOR"), "no MONITOR trigger");
  assert(!controlSrc.includes("HOLD"), "no HOLD trigger");
  assert(SUPPORTED_CONTROLLED_ACTION_INTENT === "REVIEW", "EWER REVIEW only");
  assert(ewxr.supportedIntent === "REVIEW", "EWXR freeze REVIEW only");
  console.log("PASS REVIEW-only trigger");

  assert(actionSrc.includes("use server"), "server action");
  assert(actionSrc.includes("runWorkspaceReviewAction"), "server action -> EWXR");
  assert(adapterSrc.includes("executeControlledAction"), "EWXR -> EWER");
  const fd = new FormData();
  fd.set("surfaceItemId", reviewIds[0]!);
  const fromAction = await submitWorkspaceReviewAction(null, fd);
  assert(fromAction.result === "SUCCESS", "server action SUCCESS");
  const fromAdapter = runWorkspaceReviewAction(reviewIds[0]!);
  assert(fromAction.fingerprint === fromAdapter.fingerprint, "action matches adapter");
  const ewerCall = executeControlledAction(
    requests.records.find((r) => r.id === fromAdapter.requestId)!,
  );
  assert(fromAdapter.ewerFingerprint === ewerCall.fingerprint, "adapter -> EWER");
  console.log("PASS server action -> EWER");

  assert(fromAdapter.result === "SUCCESS", "SUCCESS reachable");
  const failed = runWorkspaceReviewAction("");
  assert(failed.result === "FAILED", "FAILED reachable");
  const other = intents.records.find((r) => r.intent !== "REVIEW");
  assert(other, "non-REVIEW exists");
  const notReview = runWorkspaceReviewAction(other.surfaceItemId);
  assert(notReview.result === "FAILED", "non-REVIEW FAILED");
  assert(notReview.executed === false, "non-REVIEW not executed");
  assert(controlSrc.includes("SUCCESS"), "UI SUCCESS");
  assert(controlSrc.includes("BLOCKED"), "UI BLOCKED");
  assert(controlSrc.includes("FAILED"), "UI FAILED");
  const blockedRequest = requests.records.find((r) => r.requestState === "BLOCKED");
  assert(blockedRequest, "EWEB BLOCKED exists");
  const blockedEwer = executeControlledAction(blockedRequest);
  assert(blockedEwer.result === "BLOCKED", "EWER BLOCKED");
  assert(
    !reviewIds.includes(
      intents.records.find((r) => r.id === blockedRequest.intentId)?.surfaceItemId ?? "",
    ),
    "BLOCKED not wired to REVIEW trigger",
  );
  console.log("PASS SUCCESS/BLOCKED/FAILED");

  assert(controlSrc.includes("useActionState"), "ephemeral UI state");
  assert(controlSrc.includes("null"), "refresh starts empty");
  assert(!controlSrc.includes("localStorage"), "no client persist");
  assert(!actionSrc.includes("prisma"), "no prisma");
  assert(layoutSrc.includes('dynamic = "force-dynamic"'), "refresh re-reads");
  const again = runWorkspaceReviewAction(reviewIds[0]!);
  assert(again.fingerprint === fromAdapter.fingerprint, "repeat safe");
  const againAction = await submitWorkspaceReviewAction(null, fd);
  assert(againAction.fingerprint === fromAction.fingerprint, "repeat action safe");
  console.log("PASS refresh safety");

  assert(layoutSrc.includes("readProductIntelligenceExperience"), "WFX-1 PEX reader");
  assert(layoutSrc.includes("WorkspaceActionSurfacePanel"), "WFX panel");
  assert(PEX_INTELLIGENCE_ENDPOINT === "/api/product/intelligence", "PEX endpoint");
  const pexRead = await readProductIntelligenceExperience();
  assert(typeof pexRead.status === "string", "PEX experience");
  const projectsSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/projects/page.tsx"),
    "utf8",
  );
  assert(projectsSrc.includes("ProductIntelligenceExperience"), "WFX-2 list");
  assert(projectsSrc.includes("/api/project/list"), "workspace list flow");
  const detailSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/projects/[id]/page.tsx"),
    "utf8",
  );
  assert(detailSrc.includes("readProductIntelligenceExperience"), "WFX-2 detail");
  assert(getPexFreeze().fingerprint === pexFp, "PEX freeze unchanged");
  assert(getWfxFreeze().fingerprint === wfxFp, "WFX freeze unchanged");
  assert(ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1.length > 0, "WFX product");
  console.log("PASS WFX/PEX/Workspace regression");

  assert(ewxr.id === EWXR_FREEZE_ID, "EWXR freeze id");
  assert(ewxr.product === ENTERPRISE_SAAS_WORKSPACE_REVIEW_ACTION_V1, "EWXR product");
  assert(ewxr.fingerprint === "f0fb63637535c77f0420fabb1f7f3990cab74368eeeec08a40c0d884099fd2f8", "frozen EWXR freeze fp");
  assert(ewerFp === "668ee5c704c4eb4f48bd3e6dd42ebc327736b955c0687cfd1aea45ce8406e595", "frozen EWER freeze fp");
  assert(ewebFp === "e4a37df35cd54500b36cde9b857b700b76ec9be198ccab0c9159b6709cdd8e8d", "frozen EWEB freeze fp");
  assert(requestsFp === "e0cf47cab1ec4a1b3b0fac957b92fd9726a817d259409c6b3ad5ee7db03b9b25", "frozen EWEB-1 fp");
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
  assert(getPexFreeze().fingerprint === pexFp, "no PEX mutation");
  assert(ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1.length > 0, "ewi product");
  console.log("PASS frozen fingerprints unchanged");

  console.log("\n=== EPV-1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`ewxrFreeze: ${ewxrFp}`);
  console.log(`reviewItems: ${reviewIds.length}`);
  console.log("GAP: Workspace REVIEW trigger cannot reach EWEB BLOCKED (HOLD is not REVIEW). BLOCKED/FAILED are shown in UI but only SUCCESS is reachable from the REVIEW button on frozen data.");
}

void main();
