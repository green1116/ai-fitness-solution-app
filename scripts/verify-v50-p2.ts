/**
 * V50 Production Persistence — P2 Repository Foundation verification
 */
import { prisma } from "@/lib/prisma";
import {
  SAAS_PRODUCT_PERSISTENCE_P2_TAG,
  PERSISTENCE_REPOSITORY_NAMES,
  validatePersistenceP2,
  persistenceRepositories,
  isSaasProductPersistenceError,
  PERSISTENCE_ERROR_CODES,
} from "../lib/saas-product-persistence";
import { toWorkspaceDomain } from "../lib/saas-product-persistence/mappers/workspace-mapper";
import { toQuoteDomain } from "../lib/saas-product-persistence/mappers/quote-mapper";
import { toWorkflowDomain } from "../lib/saas-product-persistence/mappers/workflow-mapper";
import {
  P2_TEST_TENANT_A,
  P2_TEST_TENANT_B,
  buildQuoteTitle,
  buildWorkspaceName,
} from "../lib/saas-product-persistence/test/repository-fixtures";

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
    const runtimeValidation = await validatePersistenceP2();
    assert(runtimeValidation.valid, `P2 repository validation: ${runtimeValidation.summary}`);
    console.log("✓ P2 repository validation ok");

    const workspace = await persistenceRepositories.workspace.create({
      tenantId: P2_TEST_TENANT_A,
      name: buildWorkspaceName("verify"),
    });
    workspaceIds.push(workspace.id);
    assert(workspace.status === "ACTIVE", "workspace create");
    console.log("✓ WorkspaceRepository create ok");

    const foundWorkspace = await persistenceRepositories.workspace.findById(
      workspace.id,
      P2_TEST_TENANT_A,
    );
    assert(foundWorkspace?.id === workspace.id, "workspace findById");
    console.log("✓ WorkspaceRepository find ok");

    const archived = await persistenceRepositories.workspace.archive(workspace.id, P2_TEST_TENANT_A);
    assert(archived.status === "ARCHIVED", "workspace archive");
    console.log("✓ WorkspaceRepository archive ok");

    const quote = await persistenceRepositories.quote.create({
      workspaceId: workspace.id,
      tenantId: P2_TEST_TENANT_A,
      title: buildQuoteTitle("verify"),
      metadata: { source: "verify-v50-p2" },
    });
    quoteIds.push(quote.id);
    assert(quote.status === "DRAFT", "quote create");
    console.log("✓ QuoteRepository create ok");

    const foundQuote = await persistenceRepositories.quote.findById(quote.id, P2_TEST_TENANT_A);
    assert(foundQuote?.title === quote.title, "quote findById");
    console.log("✓ QuoteRepository find ok");

    const updatedQuote = await persistenceRepositories.quote.update(quote.id, P2_TEST_TENANT_A, {
      title: buildQuoteTitle("verify-updated"),
    });
    assert(updatedQuote.title === buildQuoteTitle("verify-updated"), "quote update");
    console.log("✓ QuoteRepository update ok");

    const workflow = await persistenceRepositories.workflow.create({
      workspaceId: workspace.id,
      tenantId: P2_TEST_TENANT_A,
      quoteId: quote.id,
      workflowType: "QUOTE",
    });
    workflowIds.push(workflow.id);
    assert(workflow.currentState === "CREATED", "workflow create");
    console.log("✓ WorkflowRepository create ok");

    const updatedWorkflow = await persistenceRepositories.workflow.updateCurrentState({
      workflowId: workflow.id,
      tenantId: P2_TEST_TENANT_A,
      toState: "APPROVED",
    });
    assert(updatedWorkflow.currentState === "APPROVED", "workflow state update");
    console.log("✓ WorkflowRepository state update ok");

    const history = await persistenceRepositories.workflowHistory.append({
      workflowId: workflow.id,
      tenantId: P2_TEST_TENANT_A,
      fromState: "CREATED",
      toState: "APPROVED",
      actor: "verify-user",
      reason: "p2 history append",
    });
    assert(history.workflowId === workflow.id, "history append");
    console.log("✓ History append ok");

    const histories = await persistenceRepositories.workflowHistory.listByWorkflowId(
      workflow.id,
      P2_TEST_TENANT_A,
    );
    assert(histories.length >= 1, "history list");
    console.log("✓ History list ok");

    const event = await persistenceRepositories.workflowEvent.append({
      workflowId: workflow.id,
      tenantId: P2_TEST_TENANT_A,
      eventType: "STATE_CHANGED",
      fromState: "CREATED",
      toState: "APPROVED",
      actor: "verify-user",
    });
    assert(event.eventType === "STATE_CHANGED", "event append");
    console.log("✓ Event append ok");

    const events = await persistenceRepositories.workflowEvent.listByEventType(
      workflow.id,
      P2_TEST_TENANT_A,
      "STATE_CHANGED",
    );
    assert(events.length >= 1, "event listByEventType");
    console.log("✓ Event list ok");

    const otherWorkspace = await persistenceRepositories.workspace.create({
      tenantId: P2_TEST_TENANT_B,
      name: buildWorkspaceName("other"),
    });
    workspaceIds.push(otherWorkspace.id);

    const crossTenantQuote = await persistenceRepositories.quote.findById(quote.id, P2_TEST_TENANT_B);
    assert(crossTenantQuote === null, "tenant isolation findById");

    let tenantMismatch = false;
    try {
      await persistenceRepositories.quote.findByWorkspaceId(workspace.id, P2_TEST_TENANT_B);
    } catch (error) {
      tenantMismatch =
        isSaasProductPersistenceError(error) &&
        error.code === PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH;
    }
    assert(tenantMismatch, "tenant isolation workspace guard");
    console.log("✓ tenant isolation ok");

    const rawWorkspace = await prisma.workspace.findFirst({
      where: { id: workspace.id, tenantId: P2_TEST_TENANT_A },
    });
    assert(Boolean(rawWorkspace), "mapper roundtrip raw row");
    const mappedWorkspace = toWorkspaceDomain(rawWorkspace!);
    assert(mappedWorkspace.id === workspace.id && mappedWorkspace.name === workspace.name, "workspace mapper roundtrip");

    const rawQuote = await prisma.quote.findFirst({
      where: { id: quote.id, tenantId: P2_TEST_TENANT_A },
    });
    const mappedQuote = toQuoteDomain(rawQuote!);
    assert(mappedQuote.id === quote.id && mappedQuote.title === updatedQuote.title, "quote mapper roundtrip");

    const rawWorkflow = await prisma.workflowInstance.findFirst({
      where: { id: workflow.id },
    });
    const mappedWorkflow = toWorkflowDomain(rawWorkflow!);
    assert(
      mappedWorkflow.id === workflow.id && mappedWorkflow.currentState === "APPROVED",
      "workflow mapper roundtrip",
    );
    console.log("✓ mapper roundtrip ok");

    assert(PERSISTENCE_REPOSITORY_NAMES.length === 5, "repository catalog");
    console.log("✓ repository catalog ok");

    console.log(`tag=${SAAS_PRODUCT_PERSISTENCE_P2_TAG}`);
    console.log("V50 P2 PASS");
  } finally {
    await cleanup({ workspaceIds, quoteIds, workflowIds });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
