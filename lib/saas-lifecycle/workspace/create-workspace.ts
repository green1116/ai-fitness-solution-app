import { DEFAULT_WORKSPACE_TYPE } from "../shared/constants";
import type { CreateWorkspaceInput } from "../shared/types";
import type { SaasLifecycleDb } from "../tenant/create-tenant";

export async function createWorkspace(db: SaasLifecycleDb, input: CreateWorkspaceInput) {
  return db.saasWorkspace.create({
    data: {
      tenantId: input.tenantId,
      organizationId: input.organizationId,
      name: input.name.trim(),
      workspaceType: input.workspaceType ?? DEFAULT_WORKSPACE_TYPE,
      status: "active",
    },
  });
}
