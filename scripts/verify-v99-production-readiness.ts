/**
 * V99 — Platform readiness & production certification verification
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
import { clearPortfolioOpsStoreForTests } from "../lib/pilot/v91";
import { clearGovernanceStoreForTests } from "../lib/pilot/v92";
import {
  assignExecutiveOwner,
  recordGovernanceDecision,
} from "../lib/pilot/v92";
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
import {
  archiveRecord,
  clearArchiveCacheForTests,
} from "../lib/pilot/v96";
import { clearComplianceCacheForTests } from "../lib/pilot/v97";
import {
  autoAssignReviewer,
  autoMarkDue,
  autoRequestExport,
  buildPolicyEnforcementDashboard,
  clearEnforcementCacheForTests,
} from "../lib/pilot/v98";
import {
  buildCertificationGates,
  buildProductionReadinessDashboard,
  buildReadinessSummary,
  certifyProductionReady,
  clearCertificationCacheForTests,
  generateCertificationPackage,
  listCertificationActions,
  recordGateReview,
  V99_PRODUCTION_READINESS_VERSION,
} from "../lib/pilot/v99";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v99";
const ACTOR = "production-readiness";

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
  console.log("V99 — Platform Readiness & Production Certification\n");
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
    productionProjectId: "proj-v99",
    productionQuoteId: "quote-v99",
    productionTenderId: "tender-v99",
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
  confirmExecutiveDecision({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "决策确认",
  });
  markExecutiveActionActed({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "行动已执行",
  });
  markExecutiveActionClosed({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "治理闭环",
  });

  const archived = archiveRecord({
    organizationId: ORG,
    actorId: ACTOR,
    sessionId: session.id,
    note: "正式归档",
  });

  autoAssignReviewer({
    organizationId: ORG,
    actorId: ACTOR,
    archiveRecordId: archived.id,
  });
  autoMarkDue({
    organizationId: ORG,
    actorId: ACTOR,
    archiveRecordId: archived.id,
  });
  autoRequestExport({
    organizationId: ORG,
    actorId: ACTOR,
    archiveRecordId: archived.id,
  });

  const enforcement = buildPolicyEnforcementDashboard(ORG);
  assert(enforcement.summary.actionsTaken >= 3, "enforcement ready");
  console.log("✓ enforcement");

  const readiness = buildReadinessSummary(ORG);
  assert(readiness.dimensions.length === 6, "readiness dimensions");
  assert(readiness.gatesTotal === 6, "certification gates");
  console.log("✓ certify readiness");

  const gates = buildCertificationGates(ORG);
  for (const gate of gates) {
    if (gate.status === "blocked") {
      recordGateReview({
        organizationId: ORG,
        actorId: ACTOR,
        gateId: gate.id,
        status: "waived",
        note: "E2E 豁免",
      });
    }
  }
  console.log("✓ review gates");

  const certPack = generateCertificationPackage({
    organizationId: ORG,
    actorId: ACTOR,
    title: "Production Certification",
  });
  assert(certPack.gates.length >= 6, "gate results");
  assert(certPack.artifacts.length >= 5, "artifact links");
  assert(certPack.auditReferences.length >= 1, "audit references");
  assert(certPack.readOnly === true, "package read only");
  console.log("✓ package");

  const certified = certifyProductionReady({
    organizationId: ORG,
    actorId: ACTOR,
    note: "平台生产认证",
  });
  assert(certified.overallReadiness === "certified", "certified status");
  console.log("✓ certify");

  const dashboard = buildProductionReadinessDashboard(ORG);
  assert(dashboard.version === V99_PRODUCTION_READINESS_VERSION, "version");
  assert(dashboard.packages.length >= 2, "package list");
  assert(listCertificationActions(ORG).length >= 3, "gate history");
  console.log("✓ readiness dashboard");

  console.log("\nPASS — V99 production readiness (in-memory)");
  console.log("  E2E: enforcement → certify → review → package → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
