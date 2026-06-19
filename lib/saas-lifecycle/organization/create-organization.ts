import { DEFAULT_ORG_TYPE } from "../shared/constants";
import type { CreateOrganizationInput } from "../shared/types";
import type { SaasLifecycleDb } from "../tenant/create-tenant";

export async function createOrganization(db: SaasLifecycleDb, input: CreateOrganizationInput) {
  return db.saasOrganization.create({
    data: {
      tenantId: input.tenantId,
      name: input.name.trim(),
      orgType: input.orgType ?? DEFAULT_ORG_TYPE,
      status: "active",
    },
  });
}
