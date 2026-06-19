import { SAAS_ERROR_CODES, SaasFoundationError } from "../shared/errors";
import { SAAS_PERMISSIONS } from "./permission-catalog";
import { SAAS_SYSTEM_ROLES } from "./role-catalog";

const PERMISSION_KEY_PATTERN = /^[a-z0-9._-]+:[a-z0-9_-]+$/;
const SYSTEM_CODE_PATTERN = /^[a-z0-9_]+$/;

export function isValidPermissionKey(key: string): boolean {
  return PERMISSION_KEY_PATTERN.test(key);
}

export function isValidSystemCode(systemCode: string): boolean {
  return SYSTEM_CODE_PATTERN.test(systemCode);
}

export function validatePermissionCatalog(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const keys = new Set<string>();

  for (const permission of SAAS_PERMISSIONS) {
    if (!isValidPermissionKey(permission.key)) {
      errors.push(`invalid permission key: ${permission.key}`);
    }
    if (keys.has(permission.key)) {
      errors.push(`duplicate permission key: ${permission.key}`);
    }
    keys.add(permission.key);
  }

  return { valid: errors.length === 0, errors };
}

export function validateRoleCatalog(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const permissionKeys = new Set(SAAS_PERMISSIONS.map((item) => item.key));
  const systemCodes = new Set<string>();

  for (const role of SAAS_SYSTEM_ROLES) {
    if (!isValidSystemCode(role.systemCode)) {
      errors.push(`invalid systemCode: ${role.systemCode}`);
    }
    if (systemCodes.has(role.systemCode)) {
      errors.push(`duplicate systemCode: ${role.systemCode}`);
    }
    systemCodes.add(role.systemCode);

    for (const key of role.permissionKeys) {
      if (!permissionKeys.has(key)) {
        errors.push(`role ${role.systemCode} references unknown permission: ${key}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidPermissionKey(key: string): void {
  if (!isValidPermissionKey(key)) {
    throw new SaasFoundationError(
      SAAS_ERROR_CODES.INVALID_PERMISSION_KEY,
      `Invalid permission key: ${key}`,
    );
  }
}

export function assertValidSystemCode(systemCode: string): void {
  if (!isValidSystemCode(systemCode)) {
    throw new SaasFoundationError(
      SAAS_ERROR_CODES.INVALID_ROLE_SYSTEM_CODE,
      `Invalid role systemCode: ${systemCode}`,
    );
  }
}
