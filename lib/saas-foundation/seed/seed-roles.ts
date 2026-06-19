import type { PrismaClient } from "@prisma/client";
import { SAAS_SYSTEM_ROLES } from "../rbac/role-catalog";

export async function seedRoles(db: PrismaClient): Promise<{ roleCount: number; rolePermissionCount: number }> {
  const permissions = await db.saasPermission.findMany({ select: { id: true, key: true } });
  const permissionIdByKey = new Map(permissions.map((item) => [item.key, item.id]));
  let rolePermissionCount = 0;

  for (const role of SAAS_SYSTEM_ROLES) {
    const savedRole = await db.saasRole.upsert({
      where: { systemCode: role.systemCode },
      create: {
        systemCode: role.systemCode,
        name: role.name,
        scope: role.scope,
        portalType: role.portalType,
        isSystem: true,
      },
      update: {
        name: role.name,
        scope: role.scope,
        portalType: role.portalType,
        isSystem: true,
      },
    });

    for (const permissionKey of role.permissionKeys) {
      const permissionId = permissionIdByKey.get(permissionKey);
      if (!permissionId) continue;

      await db.saasRolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: savedRole.id,
            permissionId,
          },
        },
        create: {
          roleId: savedRole.id,
          permissionId,
        },
        update: {},
      });
      rolePermissionCount += 1;
    }
  }

  return { roleCount: SAAS_SYSTEM_ROLES.length, rolePermissionCount };
}
