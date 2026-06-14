import { getAllPermissions } from "../permission";
import { getAllRoles } from "../role";
import type { AccessControlValidation } from "../shared/types";
import { getAllAccessRules } from "./data";

const VALID_RESOURCE_TYPES = new Set([
  "brand.profile",
  "brand.product",
  "supplier.inventory",
  "supplier.pricing",
  "tender.tender",
  "workspace.membership",
]);

export function buildAccessControlValidation(): AccessControlValidation {
  const rules = getAllAccessRules();
  const roles = getAllRoles();
  const permissions = getAllPermissions();
  const roleIds = new Set(roles.map((role) => role.roleId));
  const roleById = new Map(roles.map((role) => [role.roleId, role]));

  const roleValid = rules.every((rule) => roleIds.has(rule.role));

  const permissionValid = rules
    .filter((rule) => rule.allowed)
    .every((rule) => {
      const role = roleById.get(rule.role);
      if (!role) return false;
      return role.permissionIds.some((permissionId) => {
        const permission = permissions.find((entry) => entry.permissionId === permissionId);
        return (
          permission !== undefined &&
          permission.action === rule.action &&
          permission.resource === rule.resourceType
        );
      });
    });

  const resourceValid = rules.every((rule) => VALID_RESOURCE_TYPES.has(rule.resourceType));

  return {
    valid: roleValid && permissionValid && resourceValid,
    roleValid,
    permissionValid,
    resourceValid,
  };
}
