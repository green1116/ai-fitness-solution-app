/**
 * V80 CODE P3 — Production hardening verification
 */
import { PDFDocument } from "pdf-lib";

import { provisionTenant } from "../lib/scaffold/v80/services/tenant.service";
import { calculateBudgetScaffold } from "../lib/scaffold/v80/services/budget.service";
import { createTenderFromIntake } from "../lib/scaffold/v80/services/tender-intake.service";
import { enqueueWorkflowJob } from "../lib/scaffold/v80/workflow/runner.service";
import { withV80Lock } from "../lib/scaffold/v80/runtime/lock";
import { getV80PersistenceMode, v80Persist } from "../lib/scaffold/v80/runtime/store";
import { enforceV80RateLimit, normalizeV80Error } from "../lib/scaffold/v80/api/stability";
import { V80RuntimeError } from "../lib/scaffold/v80/runtime/errors";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testPersistence() {
  const mode = await getV80PersistenceMode();
  check(mode === "prisma" || mode === "memory", "persistence mode");
  console.log(`✓ persistence (${mode})`);
}

async function testConcurrency() {
  let counter = 0;
  await Promise.all(
    Array.from({ length: 5 }, () =>
      withV80Lock("test-key", async () => {
        const n = counter;
        await new Promise((r) => setTimeout(r, 5));
        counter = n + 1;
      }),
    ),
  );
  check(counter === 5, "lock serializes");
  console.log("✓ concurrency locks");
}

async function testIdempotency() {
  const tenant = await provisionTenant({
    organizationName: `P3 Gym ${Date.now()}`,
    plan: "PRO",
    adminEmail: "p3@test.local",
  });

  const intake1 = await createTenderFromIntake({
    projectId: tenant.workspaceId,
    tenderType: "enterprise-gym",
  });
  const intake2 = await createTenderFromIntake({
    projectId: tenant.workspaceId,
    tenderType: "enterprise-gym",
  });
  check(intake1.tenderId === intake2.tenderId, "tender idempotent");

  const b1 = await calculateBudgetScaffold({
    quoteId: intake1.quoteId,
    companySize: 30,
    budgetTier: "mid",
    organizationId: tenant.organizationId,
  });
  const b2 = await calculateBudgetScaffold({
    quoteId: intake1.quoteId,
    companySize: 30,
    budgetTier: "mid",
    organizationId: tenant.organizationId,
  });
  check(b1.budgetId === b2.budgetId, "budget idempotent");

  const job1 = await enqueueWorkflowJob({
    projectId: tenant.workspaceId,
    workflowKey: "tender-pack-complete",
  });
  const job2 = await enqueueWorkflowJob({
    projectId: tenant.workspaceId,
    workflowKey: "tender-pack-complete",
  });
  check(job1.jobId === job2.jobId, "workflow idempotent");
  check(job1.status === "completed", "workflow completed");

  const artifacts = await v80Persist.listArtifactsByProject(tenant.workspaceId);
  check(artifacts.length >= 3, "artifacts persisted");
  const doc = await PDFDocument.load(artifacts[0]!.buffer);
  check(doc.getPageCount() >= 1, "pdf valid");
  console.log("✓ idempotency + workflow recovery");
}

function testApiStability() {
  const req = new Request("http://local/api/v80/tenant/run", {
    headers: { "x-forwarded-for": "127.0.0.1" },
  });
  const rl = enforceV80RateLimit(req, "/api/v80/tenant/run", 1000);
  check(rl.ok, "rate limit ok");

  const norm = normalizeV80Error(new V80RuntimeError("bad", "VALIDATION_ERROR", 400), "trace-1");
  check(norm.code === "VALIDATION_ERROR" && norm.status === 400, "error normalized");
  console.log("✓ API stability");
}

async function main() {
  console.log("V80 CODE P3 Production Hardening Verification\n");
  await testPersistence();
  await testConcurrency();
  await testIdempotency();
  testApiStability();
  console.log("\n✅ V80 CODE P3 Hardening — verify PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
