/**
 * E07-P3 — Role Agent Marketplace Registry
 * Validates role listings against E07 AI employees
 */

import { getEmployeeById } from "../employee/employee.registry";
import { ROLE_CATALOG, listDeployableRoles } from "./role.catalog";
import {
  E07_MARKETPLACE_BASE,
  E07_MARKETPLACE_FREEZE_VERSION,
  E07_MARKETPLACE_ID,
  E07_MARKETPLACE_VERSION,
  ROLE_CATEGORIES,
  ROLE_LISTING_STATUSES,
} from "./role.constants";
import type {
  RoleCategory,
  RoleListing,
  RoleRegistryManifest,
} from "./role.types";

export function assertRoleListing(role: RoleListing): void {
  if (!role.id.trim()) throw new Error("role.id is required");
  if (!role.name.trim()) throw new Error("role.name is required");
  if (!(ROLE_CATEGORIES as readonly string[]).includes(role.category)) {
    throw new Error(`invalid role category: ${role.category}`);
  }
  if (!(ROLE_LISTING_STATUSES as readonly string[]).includes(role.listingStatus)) {
    throw new Error(`invalid listing status: ${role.listingStatus}`);
  }
  if (role.readOnly !== true) throw new Error("readOnly must be true");
  if (role.tags.length === 0) {
    throw new Error(`role ${role.id} requires tags`);
  }

  if (!getEmployeeById(role.employeeId)) {
    throw new Error(`missing E07 employee: ${role.employeeId}`);
  }
}

export function getRoleById(id: string): RoleListing | undefined {
  return ROLE_CATALOG.find((r) => r.id === id);
}

export function getRoleByCategory(
  category: RoleCategory,
): RoleListing | undefined {
  return ROLE_CATALOG.find((r) => r.category === category);
}

export function listRolesForEmployee(employeeId: string): RoleListing[] {
  return ROLE_CATALOG.filter((r) => r.employeeId === employeeId);
}

export function buildRoleRegistryManifest(
  roles: RoleListing[] = ROLE_CATALOG,
): RoleRegistryManifest {
  for (const role of roles) {
    assertRoleListing(role);
  }

  const categories = [...new Set(roles.map((r) => r.category))];
  const catalogComplete = ROLE_CATEGORIES.every((c) => categories.includes(c));
  if (!catalogComplete) {
    throw new Error("Role catalog incomplete: missing categories");
  }

  const deployable = listDeployableRoles(roles);
  if (deployable.length === 0) {
    throw new Error("Role catalog has no deployable listings");
  }

  return {
    marketplaceId: E07_MARKETPLACE_ID,
    version: E07_MARKETPLACE_VERSION,
    freezeVersion: E07_MARKETPLACE_FREEZE_VERSION,
    base: E07_MARKETPLACE_BASE,
    roleCount: roles.length,
    categories,
    roles,
    catalogComplete: true,
    readOnly: true,
  };
}

export { ROLE_CATALOG, listDeployableRoles, listRolesByTag } from "./role.catalog";
