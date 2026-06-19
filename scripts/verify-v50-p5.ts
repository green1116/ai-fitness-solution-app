/**
 * V50 Production Persistence — P5 Persistence Adapter Foundation verification
 */
import {
  SAAS_PRODUCT_PERSISTENCE_P5_TAG,
  PERSISTENCE_ADAPTER_OPERATIONS,
  PERSISTENCE_BACKENDS,
  SAAS_PRODUCT_PERSISTENCE_META,
  validatePersistenceP5,
  createPersistenceRuntime,
  resolvePersistenceBackend,
  type PersistenceRuntime,
} from "../lib/saas-product-persistence";
import {
  registerMemoryPersistenceQuote,
} from "../lib/saas-product-persistence/runtime/persistence-backend";
import {
  P5_TEST_TENANT_A,
  P5_TEST_TENANT_B,
  buildP5QuoteTitle,
  buildP5WorkspaceName,
} from "../lib/saas-product-persistence/test/persistence-adapter-fixtures";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertRuntimeInterface(runtime: PersistenceRuntime): void {
  assert(runtime.backend === "memory" || runtime.backend === "prisma", "runtime backend");
  assert(typeof runtime.workspace.create === "function", "workspace.create");
  assert(typeof runtime.workspace.resolve === "function", "workspace.resolve");
  assert(typeof runtime.workspace.list === "function", "workspace.list");
  assert(typeof runtime.workspace.updateStatus === "function", "workspace.updateStatus");
  assert(typeof runtime.workspace.archive === "function", "workspace.archive");
  assert(typeof runtime.quoteWorkflow.create === "function", "quoteWorkflow.create");
  assert(typeof runtime.quoteWorkflow.transition === "function", "quoteWorkflow.transition");
  assert(typeof runtime.quoteWorkflow.list === "function", "quoteWorkflow.list");
}

async function main() {
  const runtimeValidation = await validatePersistenceP5();
  assert(runtimeValidation.valid, `P5 adapter validation: ${runtimeValidation.summary}`);
  console.log("✓ P5 adapter validation ok");

  const memoryRuntime = createPersistenceRuntime({ backend: "memory" });
  assertRuntimeInterface(memoryRuntime);
  assert(memoryRuntime.backend === "memory", "memory backend");

  const workspace = await memoryRuntime.workspace.create({
    tenantId: P5_TEST_TENANT_A,
    name: buildP5WorkspaceName("verify"),
  });
  assert(workspace.status === "ACTIVE", "memory workspace create");

  const quote = registerMemoryPersistenceQuote(memoryRuntime, {
    workspaceId: workspace.id,
    tenantId: P5_TEST_TENANT_A,
    title: buildP5QuoteTitle("verify"),
  });

  const workflow = await memoryRuntime.quoteWorkflow.create({
    workspaceId: workspace.id,
    tenantId: P5_TEST_TENANT_A,
    quoteId: quote.id,
    actor: "verify-user",
  });
  assert(workflow.workflow.currentState === "CREATED", "memory workflow create");
  console.log("✓ memory backend ok");

  const prismaRuntime = createPersistenceRuntime({ backend: "prisma" });
  assertRuntimeInterface(prismaRuntime);
  assert(prismaRuntime.backend === "prisma", "prisma backend");
  console.log("✓ prisma backend ok");

  const switchedMemory = resolvePersistenceBackend("memory");
  const switchedPrisma = resolvePersistenceBackend("prisma");
  assert(switchedMemory === "memory", "backend switch memory");
  assert(switchedPrisma === "prisma", "backend switch prisma");

  const defaultBackend = resolvePersistenceBackend();
  assert(PERSISTENCE_BACKENDS.includes(defaultBackend), "default backend valid");
  const envBackedRuntime = createPersistenceRuntime();
  assertRuntimeInterface(envBackedRuntime);
  console.log("✓ backend switch ok");

  const isolated = await memoryRuntime.workspace.resolve(workspace.id, P5_TEST_TENANT_B);
  assert(isolated === null, "memory tenant isolation");
  console.log("✓ memory tenant isolation ok");

  const approved = await memoryRuntime.quoteWorkflow.transition({
    workflowId: workflow.workflow.id,
    tenantId: P5_TEST_TENANT_A,
    toState: "APPROVED",
    actor: "verify-user",
  });
  assert(approved.workflow.currentState === "APPROVED", "memory workflow transition");
  console.log("✓ memory workflow transition ok");

  assert(PERSISTENCE_ADAPTER_OPERATIONS.length === 2, "adapter operation catalog");
  assert(SAAS_PRODUCT_PERSISTENCE_META.readyToFreeze === true, "ready to freeze");
  console.log("✓ ready to freeze ok");

  console.log(`tag=${SAAS_PRODUCT_PERSISTENCE_P5_TAG}`);
  console.log("V50 P5 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
