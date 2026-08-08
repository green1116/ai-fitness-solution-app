/**
 * Pilot P3 — Create / Handoff Hardening verification
 * Duplicate prevention, approve path resolution, V80 idempotent create.
 */
import { randomUUID } from "node:crypto";

import {
  clearIntakeStoreForTests,
  createIntakeSession,
  deriveCreateTerminalStatus,
  getIntakeSession,
  hasCompleteProductionEntities,
  hasPartialProductionEntities,
  resolveIntakeApprovePath,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";
import { createTenderFromIntake } from "../lib/scaffold/v80/services/tender-intake.service";
import { enqueueWorkflowJob } from "../lib/scaffold/v80/workflow/runner.service";
import { memoryBackend } from "../lib/scaffold/v80/runtime/memory.backend";

const SAMPLE = `
项目名称：P3 幂等交接测试项目
招标人：测试单位
建设地点：上海
一、技术需求
1. 跑步机不少于 8 台。
`.trim();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function mustSession(id: string) {
  const s = getIntakeSession(id);
  if (!s) throw new Error("session missing");
  return s;
}

async function main() {
  console.log("=== Pilot P3 / Create & Handoff Hardening ===\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: SAMPLE,
    fileName: "p3.txt",
  });

  const session = createIntakeSession({
    organizationId: "org-p3",
    userId: "user-p3",
    fileName: "p3.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });

  assert(resolveIntakeApprovePath(session) === "create", "fresh → create");

  updateIntakeSession(session.id, {
    status: "approving",
    productionProjectId: "proj-1",
  });
  assert(
    resolveIntakeApprovePath(mustSession(session.id)) === "partial_error",
    "partial → error",
  );
  assert(hasPartialProductionEntities(mustSession(session.id)), "partial flag");

  updateIntakeSession(session.id, {
    productionTenderId: "tender-1",
    productionQuoteId: "quote-1",
    status: "failed",
  });
  assert(hasCompleteProductionEntities(mustSession(session.id)), "complete flag");
  assert(
    resolveIntakeApprovePath(mustSession(session.id)) === "resume",
    "failed+complete → resume",
  );

  updateIntakeSession(session.id, { status: "approving" });
  assert(
    resolveIntakeApprovePath(mustSession(session.id)) === "resume",
    "approving+complete → resume",
  );

  updateIntakeSession(session.id, { status: "generating" });
  assert(
    resolveIntakeApprovePath(mustSession(session.id)) === "resume",
    "generating → resume",
  );

  updateIntakeSession(session.id, {
    status: "ready",
    workflowStatus: "completed",
  });
  assert(
    resolveIntakeApprovePath(mustSession(session.id)) === "idempotent",
    "ready → idempotent",
  );
  assert(deriveCreateTerminalStatus(mustSession(session.id)) === "ready", "terminal ready");

  updateIntakeSession(session.id, {
    status: "failed",
    workflowStatus: "failed",
  });
  assert(deriveCreateTerminalStatus(mustSession(session.id)) === "failed", "terminal failed");
  console.log("PASS Approve path / terminal states (no duplicate create)");

  const projectId = `p3-${randomUUID()}`;
  const orgId = `org-${randomUUID()}`;

  await memoryBackend.saveOrg({
    id: orgId,
    name: "P3 Org",
    slug: `p3-${orgId.slice(0, 8)}`,
    adminEmail: "p3@test.local",
    plan: "PRO",
    createdAt: new Date(),
  });
  await memoryBackend.saveProject({
    id: projectId,
    organizationId: orgId,
    name: "P3 Project",
    createdAt: new Date(),
  });

  const first = await createTenderFromIntake({
    projectId,
    tenderType: "enterprise-gym",
    documentUrls: [`pilot-intake://${session.id}/p3.pdf`],
  });
  const second = await createTenderFromIntake({
    projectId,
    tenderType: "enterprise-gym",
    documentUrls: [`pilot-intake://${session.id}/p3.pdf`],
  });
  assert(first.tenderId === second.tenderId, "same v80 tenderId");
  assert(first.quoteId === second.quoteId, "same v80 quoteId");
  assert(second.idempotent === true, "second create idempotent");
  console.log("PASS Idempotent createTenderFromIntake");

  const job1 = await enqueueWorkflowJob({
    projectId,
    workflowKey: "tender-pack-complete",
  });
  const job2 = await enqueueWorkflowJob({
    projectId,
    workflowKey: "tender-pack-complete",
  });
  assert(job1.jobId === job2.jobId, "same workflow jobId");
  assert(
    ("idempotent" in job2 && job2.idempotent === true) ||
      job2.status === "completed" ||
      job1.status === job2.status,
    "workflow retry-safe",
  );
  console.log("PASS Retry-safe V80 workflow enqueue");

  assert(
    resolveIntakeApprovePath(mustSession(session.id)) !== "create",
    "mapping lock blocks create",
  );
  console.log("PASS Mapping lock intake → Project/Quote/Tender");

  console.log("\nPASS Pilot P3 Create / Handoff Hardening");
  console.log("Pilot P3 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
