/**
 * V98 — Compliance automation & policy enforcement verification
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
  retrieveAuditTrail,
} from "../lib/pilot/v96";
import {
  buildComplianceQueue,
  clearComplianceCacheForTests,
} from "../lib/pilot/v97";
import {
  autoAssignReviewer,
  autoMarkDue,
  autoRequestExport,
  buildEnforcementView,
  buildPolicyEnforcementDashboard,
  buildPolicyQueue,
  clearEnforcementCacheForTests,
  listEnforcementActions,
  V98_POLICY_ENFORCEMENT_VERSION,
} from "../lib/pilot/v98";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v98";
const ACTOR = "policy-enforcement";

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
  console.log("V98 — Compliance Automation & Policy Enforcement\n");
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
    productionProjectId: "proj-v98",
    productionQuoteId: "quote-v98",
    productionTenderId: "tender-v98",
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

  const compliance = buildComplianceQueue(ORG);
  assert(compliance.allItems.length >= 1, "compliance ready");
  console.log("✓ compliance");

  const policyQueue = buildPolicyQueue(ORG);
  assert(policyQueue.allItems.length >= 1, "policy queue");
  console.log("✓ enforce");

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
  console.log("✓ act");

  const audit = retrieveAuditTrail(ORG, session.id);
  assert(audit.readOnly === true, "audit trail");
  assert(audit.executiveActionHistory.length >= 3, "audit history");
  console.log("✓ audit");

  const exportResult = autoRequestExport({
    organizationId: ORG,
    actorId: ACTOR,
    archiveRecordId: archived.id,
  });
  assert(exportResult.auditSnapshot.readOnly === true, "audit snapshot");
  console.log("✓ export");

  const view = buildEnforcementView(ORG);
  assert(view.readOnly === true, "enforcement view");
  assert(view.actionHistory.length >= 3, "action history");

  const dashboard = buildPolicyEnforcementDashboard(ORG);
  assert(dashboard.version === V98_POLICY_ENFORCEMENT_VERSION, "version");
  assert(dashboard.summary.actionsTaken >= 3, "actions taken");
  assert(listEnforcementActions(ORG).length >= 3, "enforcement timeline");
  console.log("✓ enforcement dashboard");

  console.log("\nPASS — V98 policy enforcement (in-memory)");
  console.log("  E2E: compliance → enforce → act → audit → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
