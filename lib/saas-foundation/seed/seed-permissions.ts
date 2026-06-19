import type { PrismaClient } from "@prisma/client";
import { SAAS_PERMISSIONS } from "../rbac/permission-catalog";

export async function seedPermissions(db: PrismaClient): Promise<number> {
  for (const permission of SAAS_PERMISSIONS) {
    await db.saasPermission.upsert({
      where: { key: permission.key },
      create: {
        key: permission.key,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      },
      update: {
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      },
    });
  }
  return SAAS_PERMISSIONS.length;
}
