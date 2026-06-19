import { prisma } from "@/lib/prisma";
import { SAAS_PRODUCT_PERSISTENCE_P3_TAG } from "../shared/persistence-constants";
import type { PersistenceP3Validation } from "../shared/persistence-types";
import {
  archiveWorkspacePersisted,
  createWorkspacePersisted,
  listWorkspacesPersisted,
  resolveWorkspacePersisted,
} from "../runtime/workspace-persistence-runtime";
import {
  P3_TEST_TENANT_A,
  P3_TEST_TENANT_B,
  buildP3WorkspaceName,
} from "../test/workspace-persistence-fixtures";

export async function validatePersistenceP3(): Promise<PersistenceP3Validation> {
  const created = await createWorkspacePersisted({
    tenantId: P3_TEST_TENANT_A,
    name: buildP3WorkspaceName("validate"),
  });

  const resolved = await resolveWorkspacePersisted(created.id, P3_TEST_TENANT_A);
  const listed = await listWorkspacesPersisted(P3_TEST_TENANT_A);
  const archived = await archiveWorkspacePersisted(created.id, P3_TEST_TENANT_A);
  const crossTenant = await resolveWorkspacePersisted(created.id, P3_TEST_TENANT_B);

  const valid =
    created.status === "ACTIVE" &&
    resolved?.id === created.id &&
    listed.some((item) => item.id === created.id) &&
    archived.status === "ARCHIVED" &&
    crossTenant === null;

  await prisma.workspace.delete({ where: { id: created.id } });

  return {
    valid,
    summary: `p3Tag=${SAAS_PRODUCT_PERSISTENCE_P3_TAG} workspaceRuntimeValid=${valid}`,
  };
}
