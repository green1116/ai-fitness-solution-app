/**
 * V50 Production Persistence — P7 Audit Sweep verification
 */
import { writeFileSync } from "fs";
import { resolve } from "path";
import {
  SAAS_PRODUCT_PERSISTENCE_P7_TAG,
  SAAS_PRODUCT_PERSISTENCE_META,
  validatePersistenceP7,
  runPersistenceAuditSweep,
  buildPersistenceAuditReport,
  DEFAULT_AUDIT_REPORT_PATH,
  createPersistenceRuntime,
} from "../lib/saas-product-persistence";
import { registerMemoryPersistenceQuote } from "../lib/saas-product-persistence/runtime/persistence-backend";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validatePersistenceP7();
  const audit = validation.audit ?? (await runPersistenceAuditSweep());

  const report = buildPersistenceAuditReport(audit);
  writeFileSync(resolve(process.cwd(), DEFAULT_AUDIT_REPORT_PATH), report, "utf8");
  console.log(`✓ audit report written: ${DEFAULT_AUDIT_REPORT_PATH}`);

  assert(validation.valid, `P7 audit validation: ${validation.summary}`);
  console.log("✓ P7 audit validation ok");

  const tenantIsolation = audit.checks.find((check) => check.id === "tenant-isolation");
  assert(tenantIsolation?.status === "pass", "tenant isolation");
  console.log("✓ tenant isolation ok");

  const runtimeBoundary = audit.checks.find((check) => check.id === "runtime-boundary");
  assert(runtimeBoundary?.status === "pass", "runtime prisma boundary");
  console.log("✓ runtime boundary ok");

  const v49Boundary = audit.checks.find((check) => check.id === "v49-frozen-boundary");
  assert(v49Boundary?.status === "pass", "V49 frozen boundary");
  console.log("✓ V49 frozen boundary ok");

  const v48Boundary = audit.checks.find((check) => check.id === "v48-frozen-boundary");
  assert(v48Boundary?.status === "pass", "V48 frozen boundary");
  console.log("✓ V48 frozen boundary ok");

  const closedLoop = audit.checks.find((check) => check.id === "persistence-closed-loop");
  assert(closedLoop?.status === "pass", "persistence closed loop");
  console.log("✓ persistence closed loop ok");

  const runtime = createPersistenceRuntime({ backend: "memory" });
  const workspace = await runtime.workspace.create({
    tenantId: "p7-verify-tenant-a",
    name: "p7-verify-workspace",
  });
  const quote = registerMemoryPersistenceQuote(runtime, {
    workspaceId: workspace.id,
    tenantId: "p7-verify-tenant-a",
    title: "p7-verify-quote",
  });
  const flow = await runtime.quoteWorkflow.create({
    workspaceId: workspace.id,
    tenantId: "p7-verify-tenant-a",
    quoteId: quote.id,
  });
  const blocked = await runtime.workspace.resolve(workspace.id, "p7-verify-tenant-b");
  assert(blocked === null, "tenant A cannot access tenant B");
  assert(flow.workflow.workflowType === "QUOTE", "workflow create in loop");
  console.log("✓ runtime verification ok");

  assert(SAAS_PRODUCT_PERSISTENCE_META.readyToFreeze === true, "ready to freeze");
  console.log("✓ ready to freeze ok");

  console.log(`tag=${SAAS_PRODUCT_PERSISTENCE_P7_TAG}`);
  console.log("V50 P7 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
