import { PrismaClient } from "@prisma/client";
import {
  PERSISTENCE_TABLES,
  SAAS_PRODUCT_PERSISTENCE_P1_TAG,
} from "../shared/persistence-constants";
import type { PersistenceP1Validation } from "../shared/persistence-types";

const prisma = new PrismaClient();

export async function validatePersistenceP1(): Promise<PersistenceP1Validation> {
  const workspace = await prisma.workspace.create({
    data: {
      tenantId: "p1-validate-tenant",
      name: "p1-validate-workspace",
      status: "ACTIVE",
    },
  });

  const quote = await prisma.quote.create({
    data: {
      workspaceId: workspace.id,
      tenantId: workspace.tenantId,
      title: "p1-validate-quote",
      status: "DRAFT",
    },
  });

  const workflow = await prisma.workflowInstance.create({
    data: {
      workspaceId: workspace.id,
      quoteId: quote.id,
      workflowType: "QUOTE",
      currentState: "CREATED",
    },
  });

  await prisma.workflowHistory.create({
    data: {
      workflowId: workflow.id,
      fromState: "CREATED",
      toState: "CREATED",
      actor: "p1-validator",
    },
  });

  await prisma.workflowEvent.create({
    data: {
      workflowId: workflow.id,
      eventType: "WORKFLOW_CREATED",
      toState: "CREATED",
      actor: "p1-validator",
    },
  });

  const tenantQuotes = await prisma.quote.findMany({
    where: { tenantId: workspace.tenantId },
  });

  const valid =
    Boolean(workspace.id) &&
    Boolean(quote.id) &&
    Boolean(workflow.id) &&
    tenantQuotes.length === 1 &&
    PERSISTENCE_TABLES.length === 5;

  await prisma.workflowEvent.deleteMany({ where: { workflowId: workflow.id } });
  await prisma.workflowHistory.deleteMany({ where: { workflowId: workflow.id } });
  await prisma.workflowInstance.delete({ where: { id: workflow.id } });
  await prisma.quote.delete({ where: { id: quote.id } });
  await prisma.workspace.delete({ where: { id: workspace.id } });

  await prisma.$disconnect();

  return {
    valid,
    summary: `p1Tag=${SAAS_PRODUCT_PERSISTENCE_P1_TAG} schemaValid=${valid}`,
  };
}
