/**
 * V50 Production Persistence — P6 Parity System verification
 */
import { writeFileSync } from "fs";
import { resolve } from "path";
import { prisma } from "@/lib/prisma";
import {
  SAAS_PRODUCT_PERSISTENCE_P6_TAG,
  SAAS_PRODUCT_PERSISTENCE_META,
  runMemoryPrismaParity,
  buildParityDiffReport,
  DEFAULT_PARITY_REPORT_PATH,
  detectParityMismatches,
} from "../lib/saas-product-persistence";
import { runParityScenarioForBackend } from "../lib/saas-product-persistence/parity/parity-runner";
import { createMemoryPersistenceRuntime } from "../lib/saas-product-persistence/runtime/persistence-backend";
import {
  P6_PARITY_TENANT,
  buildP6QuoteTitle,
  buildP6WorkspaceName,
} from "../lib/saas-product-persistence/test/parity-fixtures";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const parityInput = {
  tenantId: P6_PARITY_TENANT,
  workspaceName: buildP6WorkspaceName("verify"),
  quoteTitle: buildP6QuoteTitle("verify"),
  actor: "verify-user",
};

async function cleanup(ids: {
  workspaceIds: string[];
  quoteIds: string[];
  workflowIds: string[];
}) {
  if (ids.workflowIds.length) {
    await prisma.workflowEvent.deleteMany({ where: { workflowId: { in: ids.workflowIds } } });
    await prisma.workflowHistory.deleteMany({ where: { workflowId: { in: ids.workflowIds } } });
    await prisma.workflowInstance.deleteMany({ where: { id: { in: ids.workflowIds } } });
  }
  if (ids.quoteIds.length) {
    await prisma.quote.deleteMany({ where: { id: { in: ids.quoteIds } } });
  }
  if (ids.workspaceIds.length) {
    await prisma.workspace.deleteMany({ where: { id: { in: ids.workspaceIds } } });
  }
}

async function main() {
  let comparison = await runMemoryPrismaParity(parityInput);

  try {
    const memoryRuntime = createMemoryPersistenceRuntime();
    const memoryOnly = await runParityScenarioForBackend(memoryRuntime, parityInput);
    assert(memoryOnly.snapshot.workspace.statusAfterCreate === "ACTIVE", "workspace create");
    console.log("✓ workspace create parity field ok");

    assert(memoryOnly.snapshot.workspace.statusAfterArchive === "ARCHIVED", "workspace archive");
    console.log("✓ workspace archive parity field ok");

    assert(memoryOnly.snapshot.workflow.stateAfterCreate === "CREATED", "workflow create");
    console.log("✓ workflow create parity field ok");

    assert(memoryOnly.snapshot.workflow.stateAfterApprove === "APPROVED", "workflow approve");
    console.log("✓ workflow approve parity field ok");

    assert(memoryOnly.snapshot.workflow.historyCount === 2, "history count");
    console.log("✓ history count parity field ok");

    assert(memoryOnly.snapshot.workflow.eventCount === 2, "event count");
    console.log("✓ event count parity field ok");

    comparison = await runMemoryPrismaParity(parityInput);
    const report = buildParityDiffReport(comparison);
    const reportPath = resolve(process.cwd(), DEFAULT_PARITY_REPORT_PATH);
    writeFileSync(reportPath, report, "utf8");
    console.log(`✓ parity report written: ${DEFAULT_PARITY_REPORT_PATH}`);

    assert(comparison.prismaAvailable, `prisma backend available: ${comparison.prismaError ?? "unknown"}`);
    assert(comparison.prisma !== null, "prisma snapshot");
    assert(detectParityMismatches(comparison.memory, comparison.prisma!).length === 0, "memory vs prisma parity");
    assert(comparison.passed, "parity comparison passed");
    console.log("✓ memory vs prisma parity ok");

    assert(SAAS_PRODUCT_PERSISTENCE_META.frozen === true, "frozen");
    console.log("✓ ready to freeze ok");

    if (comparison.cleanup) {
      await cleanup(comparison.cleanup);
    }

    console.log(`tag=${SAAS_PRODUCT_PERSISTENCE_P6_TAG}`);
    console.log("V50 P6 PASS");
  } finally {
    const report = buildParityDiffReport(comparison);
    writeFileSync(resolve(process.cwd(), DEFAULT_PARITY_REPORT_PATH), report, "utf8");
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
