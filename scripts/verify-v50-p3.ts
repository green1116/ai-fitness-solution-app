/**
 * V50 Production Persistence — P3 Workspace Persistence Runtime verification
 */
import { prisma } from "@/lib/prisma";
import {
  SAAS_PRODUCT_PERSISTENCE_P3_TAG,
  PERSISTENCE_WORKSPACE_RUNTIME_OPERATIONS,
  validatePersistenceP3,
  archiveWorkspacePersisted,
  createWorkspacePersisted,
  listWorkspacesPersisted,
  resolveWorkspacePersisted,
  updateWorkspaceStatusPersisted,
} from "../lib/saas-product-persistence";
import { toWorkspaceDomain } from "../lib/saas-product-persistence/mappers/workspace-mapper";
import {
  P3_TEST_TENANT_A,
  P3_TEST_TENANT_B,
  buildP3WorkspaceName,
} from "../lib/saas-product-persistence/test/workspace-persistence-fixtures";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function cleanupWorkspaceIds(workspaceIds: string[]) {
  if (workspaceIds.length) {
    await prisma.workspace.deleteMany({ where: { id: { in: workspaceIds } } });
  }
}

async function main() {
  const workspaceIds: string[] = [];

  try {
    const runtimeValidation = await validatePersistenceP3();
    assert(runtimeValidation.valid, `P3 workspace runtime validation: ${runtimeValidation.summary}`);
    console.log("✓ P3 workspace runtime validation ok");

    const created = await createWorkspacePersisted({
      tenantId: P3_TEST_TENANT_A,
      name: buildP3WorkspaceName("verify"),
    });
    workspaceIds.push(created.id);
    assert(created.tenantId === P3_TEST_TENANT_A, "create tenantId");
    assert(created.status === "ACTIVE", "create default status");
    console.log("✓ create workspace ok");

    const resolved = await resolveWorkspacePersisted(created.id, P3_TEST_TENANT_A);
    assert(resolved?.id === created.id, "resolve workspace");
    console.log("✓ resolve workspace ok");

    const listed = await listWorkspacesPersisted(P3_TEST_TENANT_A);
    assert(listed.some((item) => item.id === created.id), "list by tenant");
    console.log("✓ list by tenant ok");

    const archived = await archiveWorkspacePersisted(created.id, P3_TEST_TENANT_A);
    assert(archived.status === "ARCHIVED", "archive status");
    console.log("✓ archive workspace ok");

    const restored = await updateWorkspaceStatusPersisted({
      workspaceId: created.id,
      tenantId: P3_TEST_TENANT_A,
      status: "ACTIVE",
    });
    assert(restored.status === "ACTIVE", "update status to ACTIVE");
    console.log("✓ update workspace status ok");

    const crossTenant = await resolveWorkspacePersisted(created.id, P3_TEST_TENANT_B);
    assert(crossTenant === null, "tenant isolation");
    console.log("✓ tenant isolation ok");

    const raw = await prisma.workspace.findFirst({
      where: { id: created.id, tenantId: P3_TEST_TENANT_A },
    });
    assert(Boolean(raw), "repository round-trip raw row");
    const mapped = toWorkspaceDomain(raw!);
    assert(mapped.id === created.id && mapped.name === created.name, "repository round-trip");
    console.log("✓ repository round-trip ok");

    assert(
      PERSISTENCE_WORKSPACE_RUNTIME_OPERATIONS.length === 5,
      "workspace runtime operation catalog",
    );
    console.log("✓ workspace runtime operation catalog ok");

    console.log(`tag=${SAAS_PRODUCT_PERSISTENCE_P3_TAG}`);
    console.log("V50 P3 PASS");
  } finally {
    await cleanupWorkspaceIds(workspaceIds);
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
