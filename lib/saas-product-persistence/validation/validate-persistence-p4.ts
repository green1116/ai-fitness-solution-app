import { prisma } from "@/lib/prisma";
import { SAAS_PRODUCT_PERSISTENCE_P4_TAG } from "../shared/persistence-constants";
import type { PersistenceP4Validation } from "../shared/persistence-types";
import { persistenceRepositories } from "../repositories";
import { createWorkspacePersisted } from "../runtime/workspace-persistence-runtime";
import {
  createQuoteWorkflow,
  listQuoteWorkflows,
  transitionQuoteWorkflow,
} from "../runtime/quote-workflow-persistence-runtime";
import {
  P4_TEST_TENANT_A,
  P4_TEST_TENANT_B,
  buildP4QuoteTitle,
  buildP4WorkspaceName,
} from "../test/quote-workflow-persistence-fixtures";

async function cleanup(workflowId: string, quoteId: string, workspaceId: string) {
  await prisma.workflowEvent.deleteMany({ where: { workflowId } });
  await prisma.workflowHistory.deleteMany({ where: { workflowId } });
  await prisma.workflowInstance.delete({ where: { id: workflowId } });
  await prisma.quote.delete({ where: { id: quoteId } });
  await prisma.workspace.delete({ where: { id: workspaceId } });
}

export async function validatePersistenceP4(): Promise<PersistenceP4Validation> {
  const workspace = await createWorkspacePersisted({
    tenantId: P4_TEST_TENANT_A,
    name: buildP4WorkspaceName("validate"),
  });

  const quote = await persistenceRepositories.quote.create({
    workspaceId: workspace.id,
    tenantId: workspace.tenantId,
    title: buildP4QuoteTitle("validate"),
  });

  const created = await createQuoteWorkflow({
    workspaceId: workspace.id,
    tenantId: workspace.tenantId,
    quoteId: quote.id,
    actor: "p4-validator",
  });

  const approved = await transitionQuoteWorkflow({
    workflowId: created.workflow.id,
    tenantId: workspace.tenantId,
    toState: "APPROVED",
    actor: "p4-validator",
  });

  const listed = await listQuoteWorkflows(workspace.id, workspace.tenantId);
  const crossTenant = await persistenceRepositories.workflow.findById(
    created.workflow.id,
    P4_TEST_TENANT_B,
  );

  const histories = await persistenceRepositories.workflowHistory.listByWorkflowId(
    created.workflow.id,
    workspace.tenantId,
  );
  const events = await persistenceRepositories.workflowEvent.listByWorkflowId(
    created.workflow.id,
    workspace.tenantId,
  );

  const valid =
    created.workflow.workflowType === "QUOTE" &&
    created.workflow.currentState === "CREATED" &&
    created.event.eventType === "WORKFLOW_CREATED" &&
    approved.workflow.currentState === "APPROVED" &&
    approved.history.toState === "APPROVED" &&
    approved.event.eventType === "STATE_CHANGED" &&
    listed.some((item) => item.id === created.workflow.id) &&
    crossTenant === null &&
    histories.length >= 2 &&
    events.length >= 2;

  await cleanup(created.workflow.id, quote.id, workspace.id);

  return {
    valid,
    summary: `p4Tag=${SAAS_PRODUCT_PERSISTENCE_P4_TAG} quoteWorkflowRuntimeValid=${valid}`,
  };
}
