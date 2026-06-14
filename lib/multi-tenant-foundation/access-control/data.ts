import type { AccessRule } from "../shared/types";

export const ACCESS_RULES: AccessRule[] = [
  {
    resourceType: "brand.profile",
    action: "read",
    role: "role-brand-admin",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "brand.profile",
    action: "write",
    role: "role-brand-admin",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "brand.profile",
    action: "write",
    role: "role-brand-editor",
    allowed: false,
    mode: "multi-tenant",
  },
  {
    resourceType: "brand.product",
    action: "read",
    role: "role-brand-editor",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "brand.product",
    action: "write",
    role: "role-brand-editor",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "supplier.inventory",
    action: "read",
    role: "role-supplier-admin",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "supplier.inventory",
    action: "write",
    role: "role-supplier-admin",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "supplier.inventory",
    action: "write",
    role: "role-supplier-editor",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "supplier.pricing",
    action: "write",
    role: "role-supplier-admin",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "supplier.pricing",
    action: "write",
    role: "role-supplier-editor",
    allowed: false,
    mode: "multi-tenant",
  },
  {
    resourceType: "tender.tender",
    action: "create",
    role: "role-tender-owner-admin",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "tender.tender",
    action: "publish",
    role: "role-tender-owner-admin",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "tender.tender",
    action: "publish",
    role: "role-tender-owner-publisher",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "tender.tender",
    action: "approve",
    role: "role-tender-owner-publisher",
    allowed: false,
    mode: "multi-tenant",
  },
  {
    resourceType: "workspace.membership",
    action: "manage",
    role: "role-brand-admin",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "workspace.membership",
    action: "manage",
    role: "role-supplier-admin",
    allowed: true,
    mode: "multi-tenant",
  },
  {
    resourceType: "workspace.membership",
    action: "manage",
    role: "role-tender-owner-admin",
    allowed: true,
    mode: "multi-tenant",
  },
];

export function getAllAccessRules(): AccessRule[] {
  return [...ACCESS_RULES];
}

export function getAccessRulesByRole(role: string): AccessRule[] {
  return ACCESS_RULES.filter((rule) => rule.role === role);
}

export function getAccessRulesByResourceType(resourceType: string): AccessRule[] {
  return ACCESS_RULES.filter((rule) => rule.resourceType === resourceType);
}
