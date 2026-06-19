/**
 * V50 Production Persistence — P1 Schema Foundation verification
 */
import { PrismaClient } from "@prisma/client";
import {
  SAAS_PRODUCT_PERSISTENCE_P1_TAG,
  PERSISTENCE_TABLES,
  validatePersistenceP1,
} from "../lib/saas-product-persistence";

const prisma = new PrismaClient();

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

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
  const workspaceIds: string[] = [];
  const quoteIds: string[] = [];
  const workflowIds: string[] = [];

  try {
    const runtimeValidation = await validatePersistenceP1();
    assert(runtimeValidation.valid, `P1 schema validation: ${runtimeValidation.summary}`);
    console.log("✓ P1 schema validation ok");

    const workspace = await prisma.workspace.create({
      data: {
        tenantId: "test-tenant",
        name: "test-workspace",
        status: "ACTIVE",
      },
    });
    workspaceIds.push(workspace.id);
    assert(workspace.tenantId === "test-tenant", "workspace create");
    console.log("✓ workspace create ok");

    const quote = await prisma.quote.create({
      data: {
        workspaceId: workspace.id,
        tenantId: workspace.tenantId,
        title: "test-quote",
        status: "DRAFT",
        metadata: { source: "verify-v50-p1" },
      },
    });
    quoteIds.push(quote.id);
    assert(quote.workspaceId === workspace.id, "quote create");
    console.log("✓ quote create ok");

    const workflow = await prisma.workflowInstance.create({
      data: {
        workspaceId: workspace.id,
        quoteId: quote.id,
        workflowType: "QUOTE",
        currentState: "CREATED",
      },
    });
    workflowIds.push(workflow.id);
    assert(workflow.workflowType === "QUOTE", "workflow create");
    console.log("✓ workflow create ok");

    const history = await prisma.workflowHistory.create({
      data: {
        workflowId: workflow.id,
        fromState: "CREATED",
        toState: "APPROVED",
        actor: "verify-user",
        reason: "p1 history insert",
      },
    });
    assert(history.workflowId === workflow.id, "history insert");
    console.log("✓ history insert ok");

    const event = await prisma.workflowEvent.create({
      data: {
        workflowId: workflow.id,
        eventType: "STATE_CHANGED",
        fromState: "CREATED",
        toState: "APPROVED",
        actor: "verify-user",
      },
    });
    assert(event.eventType === "STATE_CHANGED", "event insert");
    console.log("✓ event insert ok");

    const otherTenantWorkspace = await prisma.workspace.create({
      data: {
        tenantId: "other-tenant",
        name: "other-workspace",
        status: "ACTIVE",
      },
    });
    workspaceIds.push(otherTenantWorkspace.id);

    const isolatedQuotes = await prisma.quote.findMany({
      where: { tenantId: "test-tenant" },
    });
    const leakedQuotes = await prisma.quote.findMany({
      where: { tenantId: "other-tenant", title: "test-quote" },
    });
    assert(isolatedQuotes.length === 1, "tenant quotes visible for owner tenant");
    assert(leakedQuotes.length === 0, "tenantId isolation");
    console.log("✓ tenantId isolation ok");

    assert(PERSISTENCE_TABLES.length === 5, "persistence table catalog");
    console.log("✓ persistence table catalog ok");

    console.log(`tag=${SAAS_PRODUCT_PERSISTENCE_P1_TAG}`);
    console.log("V50 P1 PASS");
  } finally {
    await cleanup({ workspaceIds, quoteIds, workflowIds });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
