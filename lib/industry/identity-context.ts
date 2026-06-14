import {
  getMemberById,
  getOrganizationMemberLink,
  getOrganizationMembersByMemberId,
} from "./member-registry";
import { getOrganizationById } from "./organization-registry";
import { getPermissionById } from "./permission-registry";
import { getRoleById } from "./role-registry";
import type { IndustryIdentityContext, IndustryPlatformValidation, RegistryValidation } from "./shared/types";
import { CANONICAL_INDUSTRY_IDENTITY_QUERY } from "./shared/types";
import { validateMemberRegistry } from "./member-registry";
import { validateOrganizationRegistry } from "./organization-registry";
import { validatePermissionRegistry } from "./permission-registry";
import { validateRoleRegistry } from "./role-registry";

export function buildIndustryIdentityContext(input: {
  organizationId: string;
  memberId: string;
}): IndustryIdentityContext | null {
  const organization = getOrganizationById(input.organizationId);
  const member = getMemberById(input.memberId);
  const organizationMember = getOrganizationMemberLink(input.organizationId, input.memberId);

  if (!organization || !member || !organizationMember) {
    return null;
  }

  const roles = organizationMember.roleIds
    .map((roleId) => getRoleById(roleId))
    .filter((role): role is NonNullable<typeof role> => role !== undefined);

  const permissionIds = new Set(roles.flatMap((role) => role.permissionIds));
  const permissions = [...permissionIds]
    .map((permissionId) => getPermissionById(permissionId))
    .filter((permission): permission is NonNullable<typeof permission> => permission !== undefined);

  return {
    contextId: `identity-context-${input.organizationId}-${input.memberId}`,
    organization,
    member,
    organizationMember,
    roles,
    permissions,
    mode: "industry-platform",
  };
}

export function validateIndustryIdentityContext(context: IndustryIdentityContext): boolean {
  return (
    context.organization.organizationId === context.organizationMember.organizationId &&
    context.member.memberId === context.organizationMember.memberId &&
    context.roles.length > 0 &&
    context.permissions.length > 0 &&
    context.roles.every((role) => role.permissionIds.length > 0) &&
    context.mode === "industry-platform"
  );
}

export function validateIdentityContextRegistry(): RegistryValidation {
  const canonical = buildIndustryIdentityContext(CANONICAL_INDUSTRY_IDENTITY_QUERY);
  const crossOrgMember = getOrganizationMembersByMemberId("ind-member-cross-org");
  const crossOrgContexts = crossOrgMember
    .map((entry) =>
      buildIndustryIdentityContext({
        organizationId: entry.organizationId,
        memberId: entry.memberId,
      }),
    )
    .filter((context): context is IndustryIdentityContext => context !== null);

  const canonicalValid = canonical !== null && validateIndustryIdentityContext(canonical);
  const multiOrgValid =
    crossOrgContexts.length >= 3 &&
    crossOrgContexts.every((context) => validateIndustryIdentityContext(context));

  const valid = canonicalValid && multiOrgValid;

  return {
    valid,
    count: crossOrgContexts.length + (canonical ? 1 : 0),
    summary: `identity-context canonical=${canonicalValid} multiOrg=${multiOrgValid} valid=${valid}`,
  };
}

export function validateIndustryPlatform(): IndustryPlatformValidation {
  const organizationRegistry = validateOrganizationRegistry();
  const memberRegistry = validateMemberRegistry();
  const roleRegistry = validateRoleRegistry();
  const permissionRegistry = validatePermissionRegistry();
  const identityContext = validateIdentityContextRegistry();

  const valid =
    organizationRegistry.valid &&
    memberRegistry.valid &&
    roleRegistry.valid &&
    permissionRegistry.valid &&
    identityContext.valid;

  return {
    valid,
    organizationRegistry,
    memberRegistry,
    roleRegistry,
    permissionRegistry,
    identityContext,
  };
}
