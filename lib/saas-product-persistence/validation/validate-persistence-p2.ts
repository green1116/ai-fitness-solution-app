import { prisma } from "@/lib/prisma";
import {
  SAAS_PRODUCT_PERSISTENCE_P2_TAG,
} from "../shared/persistence-constants";
import type { PersistenceP2Validation } from "../shared/persistence-types";
import { persistenceRepositories } from "../repositories";
import {
  P2_TEST_TENANT_A,
  buildQuoteTitle,
  buildWorkspaceName,
} from "../test/repository-fixtures";

export async function validatePersistenceP2(): Promise<PersistenceP2Validation> {
  const workspace = await persistenceRepositories.workspace.create({
    tenantId: P2_TEST_TENANT_A,
    name: buildWorkspaceName("validate"),
  });

  const quote = await persistenceRepositories.quote.create({
    workspaceId: workspace.id,
    tenantId: workspace.tenantId,
    title: buildQuoteTitle("validate"),
  });

  const workflow = await persistenceRepositories.workflow.create({
    workspaceId: workspace.id,
    tenantId: workspace.tenantId,
    quoteId: quote.id,
    workflowType: "QUOTE",
  });

  await persistenceRepositories.workflowHistory.append({
    workflowId: workflow.id,
    tenantId: workspace.tenantId,
    fromState: "CREATED",
    toState: "CREATED",
    actor: "p2-validator",
  });

  await persistenceRepositories.workflowEvent.append({
    workflowId: workflow.id,
    tenantId: workspace.tenantId,
    eventType: "WORKFLOW_CREATED",
    toState: "CREATED",
    actor: "p2-validator",
  });

  const found = await persistenceRepositories.workspace.findById(workspace.id, workspace.tenantId);
  const quotes = await persistenceRepositories.quote.findByWorkspaceId(workspace.id, workspace.tenantId);

  const valid =
    Boolean(found?.id) &&
    quotes.length === 1 &&
    workflow.workflowType === "QUOTE";

  await prisma.workflowEvent.deleteMany({ where: { workflowId: workflow.id } });
  await prisma.workflowHistory.deleteMany({ where: { workflowId: workflow.id } });
  await prisma.workflowInstance.delete({ where: { id: workflow.id } });
  await prisma.quote.delete({ where: { id: quote.id } });
  await prisma.workspace.delete({ where: { id: workspace.id } });

  return {
    valid,
    summary: `p2Tag=${SAAS_PRODUCT_PERSISTENCE_P2_TAG} repositoryValid=${valid}`,
  };
}
