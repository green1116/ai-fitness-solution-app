/**
 * EWUI-1 — Workspace Action UI Integration verification
 */
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
  ESOS_1_ID,
  buildOperationsSurface,
  clearOperationsSurface,
  getOperationsSurface,
} from "../lib/commercial/operations-surface";
import {
  EAC_1_ID,
  ACTION_CONSUMPTION_STATES,
  ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1,
  buildActionConsumptionItems,
  buildEacFreeze,
  clearActionConsumptionItems,
  clearEacFreeze,
  getActionConsumptionItems,
  getEacFreeze,
} from "../lib/commercial/action-consumption";
import {
  ACTION_DELIVERY_VERSION,
  EADS_1_ID,
  ENTERPRISE_SAAS_ACTION_DELIVERY_V1,
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
  readProductIntelligenceExperience,
} from "../lib/product/experience";
import {
  buildEwasFreeze,
  clearEwasFreeze,
  getEwasFreeze,
} from "../lib/workflow/experience/ewas-freeze-manifest";
import {
  EWAS_1_ID,
  WORKSPACE_ACTION_SURFACE_VERSION,
  buildWorkspaceActionSurface,
  clearWorkspaceActionSurface,
  getWorkspaceActionSurface,
  readWorkspaceActionSurface,
} from "../lib/workflow/experience/workspace-action-surface";
import {
  buildPexFreeze,
  clearPexFreeze,
  getPexFreeze,
} from "../lib/product/experience";
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

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== EWUI-1 Workspace Action UI Integration ===\n");

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
  const viewFp = view.fingerprint;
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
  const ewas = buildEwasFreeze();
  const ewasFp = ewas.fingerprint;
  const first = buildWorkspaceActionSurface();
  const actionSurfaceFp = first.fingerprint;

  assert(first.workPackageId === EWAS_1_ID, "id");
  assert(first.baselineTag === ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1, "baseline");
  assert(first.version === WORKSPACE_ACTION_SURFACE_VERSION, "version");
  assert(first.recordCount === consumption.recordCount, "record count");
  assert(first.availableCount === consumption.availableCount, "available");
  assert(first.attentionCount === consumption.attentionCount, "attention");
  assert(first.deferredCount === consumption.deferredCount, "deferred");
  assert(first.items.length === consumption.records.length, "items length");
  for (let i = 0; i < first.items.length; i += 1) {
    const item = first.items[i]!;
    const src = consumption.records[i]!;
    assert(item.id === src.id, "same item id");
    assert(item.customerId === src.customerId, "same customer");
    assert(item.state === src.state, "same state");
    assert(item.fingerprint === src.fingerprint, "same item fp");
  }
  assert(
    first.items.every((r) =>
      (ACTION_CONSUMPTION_STATES as readonly string[]).includes(r.state),
    ),
    "state enum",
  );
  for (let i = 1; i < first.items.length; i += 1) {
    const prev = first.items[i - 1]!;
    const cur = first.items[i]!;
    const rank = { ATTENTION: 0, AVAILABLE: 1, DEFERRED: 2 } as const;
    assert(
      rank[prev.state] < rank[cur.state] ||
        (rank[prev.state] === rank[cur.state] &&
          prev.customerId <= cur.customerId),
      "stable order",
    );
  }
  assert(first.actionConsumptionFingerprint === consumptionFp, "EAC fp");
  assert(first.eacFreezeFingerprint === eacFp, "EAC freeze fp");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDuplicateActionModel === true, "no duplicate model");
  assert(first.scope.noPersistence === true, "noPersistence");
  assert(first.scope.noFrozenLayerChanges === true, "noFrozenLayerChanges");
  assert(first.fingerprint.length === 64, "fingerprint");
  assert(getActionConsumptionItems().fingerprint === consumptionFp, "no EAC mutation");
  assert(getActionDeliveryItems().fingerprint === deliveryFp, "no EADS-1 mutation");
  assert(getWorkspaceActionOutcomes().fingerprint === outcomesFp, "no EWA-3 mutation");
  assert(getEwaFreeze().fingerprint === ewaFp, "no EWA freeze mutation");
  assert(getEadsFreeze().fingerprint === eadsFp, "no EADS freeze mutation");
  assert(getEacFreeze().fingerprint === eacFp, "no EAC freeze mutation");
  assert(getEwasFreeze().fingerprint === ewasFp, "no EWAS freeze mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "no ESOS mutation");
  assert(getProductIntelligenceView().fingerprint === viewFp, "no EPI mutation");
  assert(getPexFreeze().fingerprint === pexFp, "no PEX mutation");
  assert(getWfxFreeze().fingerprint === wfxFp, "no WFX mutation");
  assert(PEX_INTELLIGENCE_ENDPOINT === "/api/product/intelligence", "endpoint");
  const layoutSrc = readFileSync(
    join(process.cwd(), "app/(workspace)/layout.tsx"),
    "utf8",
  );
  assert(layoutSrc.includes("readProductIntelligenceExperience"), "WFX-1 reader preserved");
  assert(layoutSrc.includes("WorkspaceActionSurfacePanel"), "EWUI layout panel");
  const panelPath = join(process.cwd(), "app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(existsSync(panelPath), "EWUI panel module");
  const panelSrc = readFileSync(panelPath, "utf8");
  assert(panelSrc.includes("readWorkspaceActionSurface"), "EWUI reader");
  assert(panelSrc.includes("ATTENTION"), "EWUI attention label");
  assert(panelSrc.includes("AVAILABLE"), "EWUI available label");
  assert(panelSrc.includes("DEFERRED"), "EWUI deferred label");
  assert(panelSrc.includes("surface.items"), "EWUI item render");
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
  assert(
    existsSync(
      join(process.cwd(), "lib/workflow/experience/workspace-action-surface.ts"),
    ),
    "EWAS surface module",
  );
  const ewassSrc = readFileSync(
    join(process.cwd(), "lib/workflow/experience/workspace-action-surface.ts"),
    "utf8",
  );
  assert(ewassSrc.includes("readWorkspaceActionSurface"), "EWAS read contract");
  assert(ewassSrc.includes("getActionConsumptionItems"), "consumes EAC");
  assert(!ewassSrc.includes("buildWorkspaceActions"), "no EWA derive");
  const read = readWorkspaceActionSurface();
  assert(read.fingerprint === actionSurfaceFp, "read contract");
  const pexRead = await readProductIntelligenceExperience();
  assert(pexRead.status === view.status, "workspace PEX integration");
  console.log("PASS Build");
  console.log("PASS UI Integration");

  const emptyConsumption = {
    ...consumption,
    records: [],
    recordCount: 0,
    availableCount: 0,
    attentionCount: 0,
    deferredCount: 0,
  };
  clearWorkspaceActionSurface();
  const emptyFirst = buildWorkspaceActionSurface({ consumption: emptyConsumption });
  assert(emptyFirst.recordCount === 0, "empty records");
  assert(emptyFirst.availableCount === 0, "empty available");
  assert(emptyFirst.attentionCount === 0, "empty attention");
  assert(emptyFirst.deferredCount === 0, "empty deferred");
  assert(emptyFirst.items.length === 0, "empty items");
  assert(emptyFirst.fingerprint.length === 64, "empty fingerprint");
  const emptySecond = buildWorkspaceActionSurface({ consumption: emptyConsumption });
  assert(emptySecond.fingerprint === emptyFirst.fingerprint, "empty deterministic");
  console.log("PASS Empty");

  clearWorkspaceActionSurface();
  const second = buildWorkspaceActionSurface();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(getWorkspaceActionSurface().fingerprint === first.fingerprint, "cache");
  const mutated = getWorkspaceActionSurface();
  (mutated as { attentionCount: number }).attentionCount = -1;
  assert(
    getWorkspaceActionSurface().attentionCount === first.attentionCount,
    "clone-on-get",
  );
  clearWorkspaceActionSurface();
  const third = buildWorkspaceActionSurface();
  assert(third.fingerprint === first.fingerprint, "after clear");
  assert(getActionConsumptionItems().fingerprint === consumptionFp, "still no EAC mutation");
  assert(getEacFreeze().fingerprint === eacFp, "still no EAC freeze mutation");
  assert(getEwasFreeze().fingerprint === ewasFp, "still no EWAS freeze mutation");
  assert(getEadsFreeze().fingerprint === eadsFp, "still no EADS freeze mutation");
  assert(getEspoFreeze().fingerprint === freezeFp, "still no ESPO mutation");
  assert(getOperationsSurface().fingerprint === surfaceFp, "still no ESOS mutation");
  console.log("PASS Deterministic");

  console.log("\n=== EWUI-1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`surface: ${actionSurfaceFp}`);
  console.log(`records: ${first.recordCount}`);
  console.log(`attention: ${first.attentionCount}`);
  console.log(`available: ${first.availableCount}`);
  console.log(`deferred: ${first.deferredCount}`);
}

void main();
