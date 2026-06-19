import type { PrismaClient } from "@prisma/client";
import { SAAS_P1_TAG } from "../shared/constants";
import type { SaasSeedResult } from "../shared/types";
import { seedPermissions } from "./seed-permissions";
import { seedPlans } from "./seed-plans";
import { seedRoles } from "./seed-roles";

export interface SeedSaasFoundationOptions {
  mode?: "catalog-only";
}

export async function seedSaasFoundation(
  db: PrismaClient,
  options: SeedSaasFoundationOptions = {},
): Promise<SaasSeedResult> {
  void options.mode;

  const beforePermissions = await db.saasPermission.count();
  const beforeRoles = await db.saasRole.count();
  const beforePlans = await db.saasPlan.count();
  const beforeRolePermissions = await db.saasRolePermission.count();

  const permissionCount = await seedPermissions(db);
  const { roleCount, rolePermissionCount } = await seedRoles(db);
  const planCount = await seedPlans(db);

  const afterPermissions = await db.saasPermission.count();
  const afterRoles = await db.saasRole.count();
  const afterPlans = await db.saasPlan.count();
  const afterRolePermissions = await db.saasRolePermission.count();

  const idempotent =
    beforePermissions === afterPermissions &&
    beforeRoles === afterRoles &&
    beforePlans === afterPlans &&
    beforeRolePermissions === afterRolePermissions;

  return {
    idempotent,
    permissionCount,
    roleCount,
    planCount,
    rolePermissionCount,
    summary: `${SAAS_P1_TAG} seed complete permissions=${permissionCount} roles=${roleCount} plans=${planCount} rolePermissions=${rolePermissionCount} idempotent=${idempotent}`,
  };
}
