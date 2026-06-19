import {
  OWNER_ROLE_SYSTEM_CODE,
  SaasLifecycleError,
  SAAS_LIFECYCLE_ERROR_CODES,
} from "../shared/constants";
import type { CreateOwnerMembershipInput } from "../shared/types";
import type { SaasLifecycleDb } from "../tenant/create-tenant";

export async function createOwnerMembership(db: SaasLifecycleDb, input: CreateOwnerMembershipInput) {
  const ownerRole = await db.saasRole.findUnique({
    where: { systemCode: OWNER_ROLE_SYSTEM_CODE },
  });

  if (!ownerRole) {
    throw new SaasLifecycleError(
      SAAS_LIFECYCLE_ERROR_CODES.OWNER_ROLE_NOT_FOUND,
      `System role not found: ${OWNER_ROLE_SYSTEM_CODE}`,
    );
  }

  const user = await db.user.findUnique({ where: { id: input.userId } });
  if (!user) {
    throw new SaasLifecycleError(
      SAAS_LIFECYCLE_ERROR_CODES.USER_NOT_FOUND,
      `User not found: ${input.userId}`,
    );
  }

  return db.saasMembership.create({
    data: {
      tenantId: input.tenantId,
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      roleId: ownerRole.id,
      status: "active",
    },
  });
}
