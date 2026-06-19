/**
 * V50 Production Persistence — P4 Quote Workflow Persistence verification
 */
import { prisma } from "@/lib/prisma";
import {
  SAAS_PRODUCT_PERSISTENCE_P4_TAG,
  PERSISTENCE_QUOTE_WORKFLOW_RUNTIME_OPERATIONS,
  SAAS_PRODUCT_PERSISTENCE_META,
  validatePersistenceP4,
  persistenceRepositories,
  createWorkspacePersisted,
  createQuoteWorkflow,
  transitionQuoteWorkflow,
  listQuoteWorkflows,
} from "../lib/saas-product-persistence";
import {
  P4_TEST_TENANT_A,
  P4_TEST_TENANT_B,
  buildP4QuoteTitle,
  buildP4WorkspaceName,
} from "../lib/saas-product-persistence/test/quote-workflow-persistence-fixtures";

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
    const runtimeValidation = await validatePersistenceP4();
    assert(runtimeValidation.valid, `P4 quote workflow validation: ${runtimeValidation.summary}`);
    console.log("✓ P4 quote workflow runtime validation ok");

    const workspace = await createWorkspacePersisted({
      tenantId: P4_TEST_TENANT_A,
      name: buildP4WorkspaceName("verify"),
    });
    workspaceIds.push(workspace.id);

    const quote = await persistenceRepositories.quote.create({
      workspaceId: workspace.id,
      tenantId: P4_TEST_TENANT_A,
      title: buildP4QuoteTitle("verify"),
    });
    quoteIds.push(quote.id);

    const created = await createQuoteWorkflow({
      workspaceId: workspace.id,
      tenantId: P4_TEST_TENANT_A,
      quoteId: quote.id,
      actor: "verify-user",
      reason: "p4 create",
    });
    workflowIds.push(created.workflow.id);
    assert(created.workflow.workflowType === "QUOTE", "create workflow type");
    assert(created.workflow.currentState === "CREATED", "create workflow state");
    assert(created.event.eventType === "WORKFLOW_CREATED", "create workflow event");
    console.log("✓ create quote workflow ok");

    const approved = await transitionQuoteWorkflow({
      workflowId: created.workflow.id,
      tenantId: P4_TEST_TENANT_A,
      toState: "APPROVED",
      actor: "verify-user",
    });
    assert(approved.workflow.currentState === "APPROVED", "transition CREATED→APPROVED");
    assert(approved.history.fromState === "CREATED" && approved.history.toState === "APPROVED", "approve history");
    assert(approved.event.eventType === "STATE_CHANGED", "approve event");
    console.log("✓ transition CREATED→APPROVED ok");

    const quoteForReject = await persistenceRepositories.quote.create({
      workspaceId: workspace.id,
      tenantId: P4_TEST_TENANT_A,
      title: buildP4QuoteTitle("verify-reject"),
    });
    quoteIds.push(quoteForReject.id);

    const rejectFlow = await createQuoteWorkflow({
      workspaceId: workspace.id,
      tenantId: P4_TEST_TENANT_A,
      quoteId: quoteForReject.id,
      actor: "verify-user",
    });
    workflowIds.push(rejectFlow.workflow.id);

    const rejected = await transitionQuoteWorkflow({
      workflowId: rejectFlow.workflow.id,
      tenantId: P4_TEST_TENANT_A,
      toState: "REJECTED",
      actor: "verify-user",
    });
    assert(rejected.workflow.currentState === "REJECTED", "transition CREATED→REJECTED");
    assert(rejected.history.toState === "REJECTED", "reject history");
    assert(rejected.event.eventType === "STATE_CHANGED", "reject event");
    console.log("✓ transition CREATED→REJECTED ok");

    const histories = await persistenceRepositories.workflowHistory.listByWorkflowId(
      created.workflow.id,
      P4_TEST_TENANT_A,
    );
    assert(histories.length >= 2, "history append");
    console.log("✓ history append ok");

    const events = await persistenceRepositories.workflowEvent.listByWorkflowId(
      created.workflow.id,
      P4_TEST_TENANT_A,
    );
    assert(events.length >= 2, "event append");
    console.log("✓ event append ok");

    const listed = await listQuoteWorkflows(workspace.id, P4_TEST_TENANT_A);
    assert(listed.length >= 2, "list quote workflows");
    console.log("✓ list quote workflows ok");

    const crossTenant = await persistenceRepositories.workflow.findById(
      created.workflow.id,
      P4_TEST_TENANT_B,
    );
    assert(crossTenant === null, "tenant isolation");
    console.log("✓ tenant isolation ok");

    assert(
      PERSISTENCE_QUOTE_WORKFLOW_RUNTIME_OPERATIONS.length === 3,
      "quote workflow runtime operation catalog",
    );
    assert(SAAS_PRODUCT_PERSISTENCE_META.frozen === true, "frozen");
    console.log("✓ ready to freeze ok");

    console.log(`tag=${SAAS_PRODUCT_PERSISTENCE_P4_TAG}`);
    console.log("V50 P4 PASS");
  } finally {
    await cleanup({ workspaceIds, quoteIds, workflowIds });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
