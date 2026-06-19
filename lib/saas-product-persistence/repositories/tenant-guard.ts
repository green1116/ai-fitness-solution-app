import { prisma } from "@/lib/prisma";
import { PERSISTENCE_ERROR_CODES, SaasProductPersistenceError } from "../shared/persistence-errors";

export async function assertWorkspaceTenant(workspaceId: string, tenantId: string): Promise<void> {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, tenantId },
    select: { id: true },
  });
  if (!workspace) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH,
      `Workspace ${workspaceId} not found for tenant ${tenantId}`,
    );
  }
}

export async function assertWorkflowTenant(workflowId: string, tenantId: string): Promise<void> {
  const workflow = await prisma.workflowInstance.findFirst({
    where: {
      id: workflowId,
      workspace: { tenantId },
    },
    select: { id: true },
  });
  if (!workflow) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH,
      `Workflow ${workflowId} not found for tenant ${tenantId}`,
    );
  }
}

export async function assertQuoteTenant(quoteId: string, tenantId: string): Promise<void> {
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, tenantId },
    select: { id: true },
  });
  if (!quote) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH,
      `Quote ${quoteId} not found for tenant ${tenantId}`,
    );
  }
}
