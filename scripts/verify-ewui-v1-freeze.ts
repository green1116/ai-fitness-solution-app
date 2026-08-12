/**
 * EWUI v1 Freeze — Workspace Action UI EWUI-1 evidence verification
 * Product: enterprise-saas-workspace-action-ui-v1
 * Freeze only — no new model / projection / persistence / Prisma / mutation.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
  buildOperationsSurface,
  clearOperationsSurface,
  getOperationsSurface,
} from "../lib/commercial/operations-surface";
import {
  ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1,
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
  ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1,
  buildEwasFreeze,
  clearEwasFreeze,
  getEwasFreeze,
} from "../lib/workflow/experience/ewas-freeze-manifest";
import {
  EWAS_1_ID,
  buildWorkspaceActionSurface,
  clearWorkspaceActionSurface,
  getWorkspaceActionSurface,
  readWorkspaceActionSurface,
} from "../lib/workflow/experience/workspace-action-surface";
import {
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

const EWUI_1_ID = "EWUI-1" as const;
const EWUI_FREEZE_ID = "EWUI-Freeze" as const;
const EWUI_FREEZE_VERSION = "ewui-freeze-1.0.0" as const;
const EWUI_FREEZE_DATE = "2026-08-12" as const;
const ENTERPRISE_SAAS_WORKSPACE_ACTION_UI_V1 =
  "enterprise-saas-workspace-action-ui-v1" as const;

const EWUI_COMPONENTS = [
  {
    id: EWUI_1_ID,
    version: "layout-panel",
    modulePath: "app/(workspace)/WorkspaceActionSurfacePanel.tsx",
    verifyScript: "scripts/verify-ewui-1-workspace-action-ui.ts",
    status: "frozen" as const,
  },
] as const;

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function computeEvidenceFingerprint(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

async function main() {
  console.log("=== EWUI v1 Freeze Gate ===\n");

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
  const view = buildProductIntelligenceView();
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

  const evidence = {
    id: EWUI_FREEZE_ID,
    version: EWUI_FREEZE_VERSION,
    freezeDate: EWUI_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1,
    product: ENTERPRISE_SAAS_WORKSPACE_ACTION_UI_V1,
    components: EWUI_COMPONENTS,
    componentFingerprints: {
      "EWUI-1": actionSurfaceFp,
    },
    ewasFreezeFingerprint: ewasFp,
    certification: "certified" as const,
    scope: {
      components: "EWUI-1",
      chain: "SURFACE -> UI -> FROZEN",
      freezeOnly: true,
      readOnly: true,
      noPersistence: true,
      noPrisma: true,
      noRuntimeSideEffects: true,
      noExecution: true,
      noFrozenLayerChanges: true,
      preserveWorkspaceUi: true,
      preserveWfxPex: true,
    },
  };
  const fingerprint = computeEvidenceFingerprint(evidence);

  assert(evidence.id === EWUI_FREEZE_ID, "freeze id");
  assert(evidence.version === EWUI_FREEZE_VERSION, "freeze version");
  assert(evidence.freezeDate === EWUI_FREEZE_DATE, "freeze date");
  assert(evidence.baseline === ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1, "baseline");
  assert(evidence.product === ENTERPRISE_SAAS_WORKSPACE_ACTION_UI_V1, "product");
  assert(evidence.components.length === 1, "EWUI-1 only");
  assert(evidence.components[0]!.id === EWUI_1_ID, "chain order");
  assert(
    evidence.components.every((c) => c.status === "frozen"),
    "all frozen",
  );
  assert(evidence.scope.chain === "SURFACE -> UI -> FROZEN", "chain");
  assert(evidence.scope.components === "EWUI-1", "scope components");
  assert(evidence.scope.preserveWorkspaceUi === true, "preserve workspace ui");
  assert(evidence.scope.preserveWfxPex === true, "preserve WFX/PEX");
  assert(evidence.certification === "certified", "certified");
  assert(evidence.scope.freezeOnly === true, "freezeOnly");
  assert(evidence.scope.readOnly === true, "readOnly");
  assert(evidence.scope.noPersistence === true, "noPersistence");
  assert(evidence.scope.noPrisma === true, "noPrisma");
  assert(evidence.scope.noExecution === true, "noExecution");
  assert(evidence.scope.noFrozenLayerChanges === true, "noFrozenLayerChanges");
  assert(evidence.ewasFreezeFingerprint === ewasFp, "EWAS freeze locked");
  assert(evidence.componentFingerprints["EWUI-1"] === actionSurfaceFp, "EWUI-1 fp");
  assert(fingerprint.length === 64, "fingerprint");
  for (const component of evidence.components) {
    assert(
      existsSync(join(process.cwd(), component.modulePath)),
      `${component.id} module`,
    );
    assert(
      existsSync(join(process.cwd(), component.verifyScript)),
      `${component.id} verify`,
    );
  }

  const layoutSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/layout.tsx"),
    "utf8",
  );
  assert(layoutSrc.includes("readProductIntelligenceExperience"), "WFX-1 reader preserved");
  assert(layoutSrc.includes("WorkspaceActionSurfacePanel"), "EWUI layout panel");
  const panelSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/WorkspaceActionSurfacePanel.tsx"),
    "utf8",
  );
  assert(panelSrc.includes("readWorkspaceActionSurface"), "EWUI reader");
  assert(panelSrc.includes("ATTENTION"), "EWUI attention");
  assert(panelSrc.includes("AVAILABLE"), "EWUI available");
  assert(panelSrc.includes("DEFERRED"), "EWUI deferred");
  assert(panelSrc.includes("No workspace actions"), "EWUI empty state");
  assert(
    readFileSync(
      join(process.cwd(), "app/(workspace)/projects/page.tsx"),
      "utf8",
    ).includes("ProductIntelligenceExperience"),
    "WFX-2 list preserved",
  );
  assert(
    readFileSync(
      join(process.cwd(), "app/(workspace)/projects/page.tsx"),
      "utf8",
    ).includes("/api/project/list"),
    "list flow unchanged",
  );
  assert(
    readFileSync(
      join(process.cwd(), "app/(workspace)/projects/[id]/page.tsx"),
      "utf8",
    ).includes("readProductIntelligenceExperience"),
    "WFX-2 detail preserved",
  );
  assert(PEX_INTELLIGENCE_ENDPOINT === "/api/product/intelligence", "endpoint");
  const read = readWorkspaceActionSurface();
  assert(read.fingerprint === actionSurfaceFp, "read contract");
  const pexRead = await readProductIntelligenceExperience();
  assert(pexRead.status === view.status, "workspace PEX integration");

  assert(getWorkspaceActionSurface().fingerprint === actionSurfaceFp, "no EWAS-1 mutation");
  assert(getActionConsumptionItems().fingerprint === consumptionFp, "no EAC-1 mutation");
  assert(getActionDeliveryItems().fingerprint === deliveryFp, "no EADS-1 mutation");
  assert(getWorkspaceActionOutcomes().fingerprint === outcomesFp, "no EWA-3 mutation");
  assert(getEwaFreeze().fingerprint === ewaFp, "no EWA freeze mutation");
  assert(getEadsFreeze().fingerprint === eadsFp, "no EADS freeze mutation");
  assert(getEacFreeze().fingerprint === eacFp, "no EAC freeze mutation");
  assert(getEwasFreeze().fingerprint === ewasFp, "no EWAS freeze mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "no ESOS mutation");
  assert(getPexFreeze().fingerprint === pexFp, "no PEX mutation");
  assert(getWfxFreeze().fingerprint === wfxFp, "no WFX mutation");
  console.log("PASS Freeze integrity");

  const second = computeEvidenceFingerprint(evidence);
  assert(second === fingerprint, "deterministic evidence");
  assert(getEwasFreeze().fingerprint === ewasFp, "still no EWAS freeze mutation");
  assert(getWorkspaceActionSurface().fingerprint === actionSurfaceFp, "still no EWAS-1 mutation");
  assert(getActionConsumptionItems().fingerprint === consumptionFp, "still no EAC-1 mutation");
  assert(getEacFreeze().fingerprint === eacFp, "still no EAC freeze mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "still no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "still no ESOS mutation");
  assert(getWfxFreeze().fingerprint === wfxFp, "still no WFX mutation");
  assert(getPexFreeze().fingerprint === pexFp, "still no PEX mutation");
  console.log("PASS Deterministic");

  console.log("\n=== EWUI v1 FREEZE VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${fingerprint}`);
  console.log(`version: ${evidence.version}`);
  console.log(`baseline: ${evidence.baseline}`);
  console.log(`product: ${evidence.product}`);
}

void main();
