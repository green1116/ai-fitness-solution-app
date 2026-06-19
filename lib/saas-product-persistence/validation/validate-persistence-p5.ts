import { SAAS_PRODUCT_PERSISTENCE_P5_TAG } from "../shared/persistence-constants";
import type { PersistenceP5Validation } from "../shared/persistence-types";
import { createPersistenceRuntime } from "../runtime/persistence-adapter";
import { registerMemoryPersistenceQuote, resolvePersistenceBackend } from "../runtime/persistence-backend";
import {
  P5_TEST_TENANT_A,
  P5_TEST_TENANT_B,
  buildP5QuoteTitle,
  buildP5WorkspaceName,
} from "../test/persistence-adapter-fixtures";

export async function validatePersistenceP5(): Promise<PersistenceP5Validation> {
  const memoryRuntime = createPersistenceRuntime({ backend: "memory" });
  const prismaRuntime = createPersistenceRuntime({ backend: "prisma" });

  const workspace = await memoryRuntime.workspace.create({
    tenantId: P5_TEST_TENANT_A,
    name: buildP5WorkspaceName("validate"),
  });

  const quote = registerMemoryPersistenceQuote(memoryRuntime, {
    workspaceId: workspace.id,
    tenantId: P5_TEST_TENANT_A,
    title: buildP5QuoteTitle("validate"),
  });

  const created = await memoryRuntime.quoteWorkflow.create({
    workspaceId: workspace.id,
    tenantId: P5_TEST_TENANT_A,
    quoteId: quote.id,
    actor: "p5-validator",
  });

  const transitioned = await memoryRuntime.quoteWorkflow.transition({
    workflowId: created.workflow.id,
    tenantId: P5_TEST_TENANT_A,
    toState: "APPROVED",
    actor: "p5-validator",
  });

  const listed = await memoryRuntime.quoteWorkflow.list(workspace.id, P5_TEST_TENANT_A);
  const crossTenant = await memoryRuntime.workspace.resolve(workspace.id, P5_TEST_TENANT_B);

  const valid =
    memoryRuntime.backend === "memory" &&
    prismaRuntime.backend === "prisma" &&
    resolvePersistenceBackend("memory") === "memory" &&
    resolvePersistenceBackend("prisma") === "prisma" &&
    workspace.status === "ACTIVE" &&
    created.workflow.workflowType === "QUOTE" &&
    transitioned.workflow.currentState === "APPROVED" &&
    listed.some((item) => item.id === created.workflow.id) &&
    crossTenant === null;

  return {
    valid,
    summary: `p5Tag=${SAAS_PRODUCT_PERSISTENCE_P5_TAG} adapterValid=${valid}`,
  };
}
