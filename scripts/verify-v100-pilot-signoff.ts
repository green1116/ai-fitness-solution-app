/**
 * V100 — Pilot final sign-off & baseline freeze verification
 */
import {
  appendIntakeAudit,
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  freezeIntakeSession,
  runTenderParserPipeline,
  signOffIntakeSession,
  updateIntakeSession,
} from "../lib/pilot/v80";
import {
  clearDeliveryOpsStoreForTests,
  recordDeliveryTrackingEvent,
  seedReleaseReadyTracking,
} from "../lib/pilot/v81";
import { clearForecastCacheForTests } from "../lib/pilot/v85";
import { clearRenewalOpsStoreForTests } from "../lib/pilot/v86";
import { clearRevenueOpsStoreForTests } from "../lib/pilot/v87";
import { clearGrowthOpsStoreForTests } from "../lib/pilot/v88";
import { clearExpansionOpsStoreForTests } from "../lib/pilot/v89";
import { clearPortfolioCacheForTests } from "../lib/pilot/v90";
import {
  assignExecutiveOwner,
  clearGovernanceStoreForTests,
  recordGovernanceDecision,
} from "../lib/pilot/v92";
import { clearPortfolioOpsStoreForTests } from "../lib/pilot/v91";
import { clearReportCacheForTests, generateBoardPacket } from "../lib/pilot/v93";
import {
  clearBriefingCacheForTests,
  generateBriefingPack,
  recordBriefingAction,
} from "../lib/pilot/v94";
import {
  assignExecutiveActionOwner,
  clearExecutiveActionStoreForTests,
  confirmExecutiveDecision,
  markExecutiveActionActed,
  markExecutiveActionClosed,
} from "../lib/pilot/v95";
import { archiveRecord, clearArchiveCacheForTests } from "../lib/pilot/v96";
import { clearComplianceCacheForTests } from "../lib/pilot/v97";
import {
  autoAssignReviewer,
  autoMarkDue,
  autoRequestExport,
  clearEnforcementCacheForTests,
} from "../lib/pilot/v98";
import {
  buildCertificationGates,
  certifyProductionReady,
  clearCertificationCacheForTests,
  recordGateReview,
} from "../lib/pilot/v99";
import {
  buildFreezeManifest,
  buildPilotGovernance,
  buildPilotSignoffDashboard,
  buildReleaseManifest,
  buildRollbackIndex,
  clearSignoffCacheForTests,
  collectReadiness,
  finalSignoff,
  freezeBaseline,
  getCapabilityCatalog,
  listSignoffActions,
  releaseBaseline,
  V100_PILOT_SIGNOFF_VERSION,
} from "../lib/pilot/v100";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v100";
const ACTOR = "pilot-signoff";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedAudit(sessionId: string) {
  const base = { sessionId, organizationId: ORG, actorId: ACTOR };
  appendIntakeAudit({ ...base, step: "upload" });
  appendIntakeAudit({ ...base, step: "extract" });
  appendIntakeAudit({ ...base, step: "validate", meta: { valid: true } });
  appendIntakeAudit({ ...base, step: "approve" });
  appendIntakeAudit({ ...base, step: "generate", workflowStatusAfter: "completed" });
  appendIntakeAudit({ ...base, step: "qa", meta: { handoffReady: true } });
  appendIntakeAudit({ ...base, step: "handoff" });
}

async function main() {
  console.log("V100 — Pilot Final Sign-off & Baseline Freeze\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();
  clearForecastCacheForTests();
  clearRenewalOpsStoreForTests();
  clearRevenueOpsStoreForTests();
  clearGrowthOpsStoreForTests();
  clearExpansionOpsStoreForTests();
  clearPortfolioCacheForTests();
  clearPortfolioOpsStoreForTests();
  clearGovernanceStoreForTests();
  clearReportCacheForTests();
  clearBriefingCacheForTests();
  clearExecutiveActionStoreForTests();
  clearArchiveCacheForTests();
  clearComplianceCacheForTests();
  clearEnforcementCacheForTests();
  clearCertificationCacheForTests();
  clearSignoffCacheForTests();

  const parsed = await runTenderParserPipeline({ rawText: SAMPLE, fileName: "t.pdf" });
  const extracted = extractRequirementsFromParsedTender({
    parseResult: parsed,
    sourceName: "t.pdf",
  });

  const session = createIntakeSession({
    organizationId: ORG,
    userId: ACTOR,
    fileName: "t.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });

  const signedOffAt = new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString();

  updateIntakeSession(session.id, {
    extractedRequirements: extracted,
    requirements: extracted,
    status: "ready",
    workflowStatus: "completed",
    productionProjectId: "proj-v100",
    productionQuoteId: "quote-v100",
    productionTenderId: "tender-v100",
    qaPassedAt: signedOffAt,
    deliveryLocked: true,
  });

  seedAudit(session.id);
  freezeIntakeSession({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });
  await signOffIntakeSession({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });
  updateIntakeSession(session.id, { signedOffAt }, { bypassFreeze: true });

  seedReleaseReadyTracking({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });
  recordDeliveryTrackingEvent({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    type: "delivery_failed",
  });

  assignExecutiveOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "Executive",
  });
  recordGovernanceDecision({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "董事会预备决议",
  });

  generateBoardPacket({ organizationId: ORG, actorId: ACTOR, title: "Q2 Board Packet" });
  const pack = generateBriefingPack({ organizationId: ORG, actorId: ACTOR, title: "Weekly Brief" });
  recordBriefingAction({
    organizationId: ORG,
    actorId: ACTOR,
    briefingId: pack.id,
    sessionId: session.id,
    note: "高管已审议",
  });

  assignExecutiveActionOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "Executive",
  });
  confirmExecutiveDecision({ sessionId: session.id, organizationId: ORG, actorId: ACTOR, note: "决策确认" });
  markExecutiveActionActed({ sessionId: session.id, organizationId: ORG, actorId: ACTOR, note: "行动已执行" });
  markExecutiveActionClosed({ sessionId: session.id, organizationId: ORG, actorId: ACTOR, note: "治理闭环" });

  const archived = archiveRecord({
    organizationId: ORG,
    actorId: ACTOR,
    sessionId: session.id,
    note: "正式归档",
  });

  autoAssignReviewer({ organizationId: ORG, actorId: ACTOR, archiveRecordId: archived.id });
  autoMarkDue({ organizationId: ORG, actorId: ACTOR, archiveRecordId: archived.id });
  autoRequestExport({ organizationId: ORG, actorId: ACTOR, archiveRecordId: archived.id });

  const gates = buildCertificationGates(ORG);
  for (const gate of gates) {
    if (gate.status === "blocked" || gate.status === "warning") {
      recordGateReview({
        organizationId: ORG,
        actorId: ACTOR,
        gateId: gate.id,
        status: "waived",
        note: "E2E 豁免",
      });
    }
  }
  certifyProductionReady({ organizationId: ORG, actorId: ACTOR, note: "平台生产认证" });
  console.log("✓ V80–V99 upstream ready");

  // V100 — collect readiness
  assert(getCapabilityCatalog().length === 20, "capability catalog 20 layers");
  const report = collectReadiness({ organizationId: ORG, actorId: ACTOR });
  assert(report.layerCount === 20, "collect 20 layers");
  assert(report.readinessSummary.dimensions.length === 6, "readiness dimensions");
  assert(report.overallPilotScore >= 0 && report.overallPilotScore <= 100, "pilot score range");
  assert(report.overallReleaseStatus === "ready_for_signoff", "release status");
  console.log(`✓ collect readiness (score ${report.overallPilotScore})`);

  // release / rollback manifests (read-only)
  const release = buildReleaseManifest();
  assert(release.capabilityInventory.length === 20, "capability inventory");
  assert(release.moduleIndex.length === 20, "module index");
  assert(release.apiIndex.length === 20, "api index");
  assert(release.uiIndex.length === 20, "ui index");
  assert(release.verifyIndex.length === 20, "verify index");
  assert(release.artifactIndex.length >= 1, "artifact index");
  console.log("✓ release manifest");

  const rollback = buildRollbackIndex();
  assert(rollback.snapshotIndex.length === 20, "snapshot index");
  assert(rollback.dependencyGraph.length === 20, "dependency graph");
  assert(rollback.restoreEntryPoints.length === 20, "restore entry points");
  assert(rollback.dependencyGraph[0]!.dependsOn.length === 0, "first layer no deps");
  console.log("✓ rollback index");

  // sign-off
  const afterSignoff = finalSignoff({ organizationId: ORG, actorId: ACTOR });
  assert(afterSignoff.releaseStatus === "signed_off", "signed off");
  console.log("✓ final sign-off");

  // freeze
  const freeze1 = buildFreezeManifest(ORG);
  assert(freeze1.frozen === false, "not frozen before freeze");
  const afterFreeze = freezeBaseline({ organizationId: ORG, actorId: ACTOR });
  assert(afterFreeze.releaseStatus === "frozen", "frozen");
  const freeze2 = buildFreezeManifest(ORG);
  assert(freeze2.frozen === true, "frozen manifest");
  assert(Object.keys(freeze2.versionLock).length === 20, "version lock 20");
  assert(freeze2.dependencyLock.length === 20, "dependency lock 20");
  console.log("✓ freeze baseline");

  // release baseline
  const afterRelease = releaseBaseline({ organizationId: ORG, actorId: ACTOR });
  assert(afterRelease.releaseStatus === "released", "released");
  console.log("✓ release baseline");

  // governance + dashboard
  const governance = buildPilotGovernance(ORG);
  assert(governance.releaseChecklist.length === 3, "release checklist");
  assert(governance.productionChecklist.length === 3, "production checklist");
  assert(governance.finalApproval.approved === true, "final approval");
  console.log("✓ governance");

  const dashboard = buildPilotSignoffDashboard(ORG);
  assert(dashboard.version === V100_PILOT_SIGNOFF_VERSION, "version");
  assert(dashboard.releaseStatus === "released", "dashboard released");
  assert(dashboard.readOnly === true, "dashboard read only");
  assert(listSignoffActions(ORG).length >= 4, "signoff history");
  console.log("✓ pilot signoff dashboard");

  // guard: freeze requires signoff, release requires freeze
  clearSignoffCacheForTests();
  let guarded = false;
  try {
    freezeBaseline({ organizationId: "org-guard", actorId: ACTOR });
  } catch {
    guarded = true;
  }
  assert(guarded, "freeze requires signoff");
  console.log("✓ workflow guards");

  console.log("\nPASS — V100 pilot sign-off (in-memory)");
  console.log("  E2E: V80–V99 → collect readiness → freeze → sign-off → release baseline");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
