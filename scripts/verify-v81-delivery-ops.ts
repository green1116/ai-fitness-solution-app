/**
 * V81 — Delivery ops & customer tracking verification
 */
import {
  appendIntakeAudit,
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  freezeIntakeSession,
  listIntakeAudit,
  patchIntakeRequirements,
  runTenderParserPipeline,
  signOffIntakeSession,
  updateIntakeSession,
} from "../lib/pilot/v80";
import {
  assertReleasedReadOnly,
  buildDeliveryExportBundle,
  buildDeliveryOpsDashboard,
  clearDeliveryOpsStoreForTests,
  getDeliveryTrackingSummary,
  listDeliveryOpsNotifications,
  recordDeliveryTrackingEvent,
  seedReleaseReadyTracking,
  syncDeliveryOpsNotifications,
  V81_DELIVERY_OPS_VERSION,
} from "../lib/pilot/v81";
import { recoverIntakeSession } from "../lib/pilot/v80";

const SAMPLE = `
项目名称：星河科技园企业健身中心
招标人：星河科技园管理有限公司
`.trim();

const ORG = "org-v81";
const ACTOR = "ops-user";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertThrows(fn: () => unknown, code: string) {
  try {
    fn();
    throw new Error(`EXPECTED_THROW:${code}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === `EXPECTED_THROW:${code}`) throw e;
    assert(msg.includes(code), `expected ${code}, got ${msg}`);
  }
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
  console.log("V81 — Delivery Ops & Customer Tracking\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();

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

  updateIntakeSession(session.id, {
    extractedRequirements: extracted,
    requirements: extracted,
    status: "ready",
    workflowStatus: "completed",
    productionProjectId: "proj-v81",
    productionQuoteId: "quote-v81",
    productionTenderId: "tender-v81",
    v80WorkflowJobId: "wf-v81",
    qaPassedAt: new Date().toISOString(),
    deliveryLocked: true,
  });

  seedAudit(session.id);

  freezeIntakeSession({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });

  const signed = await signOffIntakeSession({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
  });
  assert(signed.signedOff === true, "signed off");
  console.log("✓ sign-off complete");

  seedReleaseReadyTracking({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });
  syncDeliveryOpsNotifications(
    updateIntakeSession(session.id, {}, { bypassFreeze: true })!,
  );
  console.log("✓ release notifications");

  const dashboard = await buildDeliveryOpsDashboard(ORG);
  assert(dashboard.version === V81_DELIVERY_OPS_VERSION, "dashboard version");
  assert(dashboard.releasedCount === 1, "one released project");
  assert(dashboard.items[0]?.readOnly === true, "read only item");
  assert(Boolean(dashboard.items[0]?.linkage.projectId), "stable IDs");
  console.log("✓ delivery dashboard");

  recordDeliveryTrackingEvent({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    type: "delivery_opened",
  });
  recordDeliveryTrackingEvent({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    type: "artifact_viewed",
    artifactKind: "plan",
  });

  const tracking = getDeliveryTrackingSummary(session.id);
  assert(tracking.summary.opened && tracking.summary.viewed, "customer tracking");
  console.log("✓ customer tracking events");

  const bundle = await buildDeliveryExportBundle(session.id, ORG);
  assert(bundle.readOnly === true, "export read only");
  assert(Boolean(bundle.releaseManifest), "release manifest");
  assert(bundle.rollbackIndex.length >= 1, "rollback index");
  assert(bundle.auditSummary.totalEvents >= 5, "audit summary");
  assert(bundle.tracking.length >= 2, "tracking in export");
  console.log("✓ export package bundle");

  const notifications = listDeliveryOpsNotifications(ORG);
  assert(notifications.some((n) => n.kind === "release_ready"), "release_ready hook");
  assert(notifications.some((n) => n.kind === "admin_restore_only"), "admin restore hook");
  console.log("✓ notification hooks");

  assertThrows(
    () =>
      patchIntakeRequirements({
        sessionId: session.id,
        organizationId: ORG,
        requirements: extracted,
        actorId: ACTOR,
      }),
    "RELEASE_LOCKED",
  );
  console.log("✓ no mutation after release");

  try {
    await recoverIntakeSession({
      sessionId: session.id,
      organizationId: ORG,
      actorId: ACTOR,
      action: "rollback_valid",
    });
    throw new Error("EXPECTED_THROW:RELEASE_LOCKED");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "EXPECTED_THROW:RELEASE_LOCKED") throw e;
    assert(msg.includes("RELEASE_LOCKED") || msg.includes("SESSION_ALREADY_READY"), "recovery blocked");
  }
  console.log("✓ admin restore only via explicit recovery");

  const released = updateIntakeSession(session.id, {}, { bypassFreeze: true })!;
  assertThrows(() => assertReleasedReadOnly(released, "test"), "RELEASE_LOCKED");
  console.log("✓ released read-only guard");

  console.log("\nPASS — V81 delivery ops (in-memory)");
  console.log("  E2E: sign-off → release → dashboard → track → export → read only");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
