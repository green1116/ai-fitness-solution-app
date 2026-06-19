import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { PrismaClient } from "@prisma/client";
import {
  SAAS_FOUNDATION_VERSION,
  SAAS_SCHEMA_MODELS,
} from "../shared/constants";
import type { SaasFixtureChain, SaasFoundationP1Validation } from "../shared/types";
import { assertMembershipOrganizationMatch } from "../member/membership-validation";
import { SAAS_PLANS } from "../subscription/plan-catalog";
import { assertValidSubscriptionPeriod } from "../subscription/subscription-validation";
import { SAAS_SYSTEM_ROLES } from "../rbac/role-catalog";
import { validatePermissionCatalog, validateRoleCatalog } from "../rbac/rbac-validation";
import { validatePlanCatalog } from "../subscription/subscription-validation";
import { SAAS_PERMISSIONS } from "../rbac/permission-catalog";

const FORBIDDEN_IMPORT_PATTERN =
  /(?:from\s+["']@\/lib\/commercial-products|from\s+["'][./].*commercial-products|import\s*\(\s*["']@\/lib\/commercial-products)/;

function scanForbiddenImports(rootDir: string): string[] {
  const violations: string[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;
      const content = readFileSync(fullPath, "utf8");
      if (FORBIDDEN_IMPORT_PATTERN.test(content)) {
        violations.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return violations;
}

export function validateSaasFoundationP1(): SaasFoundationP1Validation {
  const permissionValidation = validatePermissionCatalog();
  const roleValidation = validateRoleCatalog();
  const planValidation = validatePlanCatalog();
  const foundationRoot = join(process.cwd(), "lib", "saas-foundation");
  const foundationViolations = scanForbiddenImports(foundationRoot);
  const boundaryClean = foundationViolations.length === 0;

  const valid =
    permissionValidation.valid &&
    roleValidation.valid &&
    planValidation.valid &&
    boundaryClean &&
    SAAS_PERMISSIONS.length >= 16 &&
    SAAS_SYSTEM_ROLES.length >= 10 &&
    SAAS_PLANS.length >= 5;

  return {
    valid,
    version: SAAS_FOUNDATION_VERSION,
    permissionCount: SAAS_PERMISSIONS.length,
    roleSystemCodes: SAAS_SYSTEM_ROLES.map((role) => role.systemCode),
    planCodes: SAAS_PLANS.map((plan) => plan.code),
    schemaModels: SAAS_SCHEMA_MODELS,
    boundaryClean,
    summary: [
      `permissionValid=${permissionValidation.valid}`,
      `roleValid=${roleValidation.valid}`,
      `planValid=${planValidation.valid}`,
      `boundaryClean=${boundaryClean}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export async function createSaasFixtureChain(db: PrismaClient): Promise<SaasFixtureChain> {
  const suffix = Date.now().toString(36);
  const trialPlan = await db.saasPlan.findUniqueOrThrow({ where: { code: "trial" } });
  const ownerRole = await db.saasRole.findUniqueOrThrow({ where: { systemCode: "enterprise_owner" } });
  const periodStart = new Date();
  const periodEnd = new Date(Date.now() + 14 * 24 * 3600 * 1000);
  assertValidSubscriptionPeriod(periodStart, periodEnd);

  const user = await db.user.create({
    data: { email: `saas-fixture-${suffix}@example.com`, name: "SaaS Fixture User" },
  });

  const tenant = await db.saasTenant.create({
    data: {
      slug: `fixture-${suffix}`,
      name: "Fixture Tenant",
      status: "trial",
      portalType: "enterprise",
    },
  });

  const organization = await db.saasOrganization.create({
    data: {
      tenantId: tenant.id,
      name: "Fixture Organization",
      orgType: "enterprise",
      status: "active",
    },
  });

  const workspace = await db.saasWorkspace.create({
    data: {
      tenantId: tenant.id,
      organizationId: organization.id,
      name: "Fixture Workspace",
      workspaceType: "project",
      status: "active",
    },
  });

  const membership = await db.saasMembership.create({
    data: {
      tenantId: tenant.id,
      organizationId: organization.id,
      workspaceId: workspace.id,
      userId: user.id,
      roleId: ownerRole.id,
      status: "active",
    },
  });

  if (!assertMembershipOrganizationMatch(membership.organizationId, workspace.organizationId)) {
    throw new Error("Membership organizationId mismatch");
  }

  const subscription = await db.saasSubscription.create({
    data: {
      tenantId: tenant.id,
      planId: trialPlan.id,
      status: "trialing",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
  });

  const grant = await db.saasEntitlementGrant.create({
    data: {
      tenantId: tenant.id,
      feature: "commercial.quote",
      enabled: true,
      quota: 20,
      used: 0,
      source: "trial",
    },
  });

  return {
    tenantId: tenant.id,
    organizationId: organization.id,
    workspaceId: workspace.id,
    userId: user.id,
    membershipId: membership.id,
    subscriptionId: subscription.id,
    grantId: grant.id,
  };
}

export async function cleanupSaasFixtureChain(db: PrismaClient, chain: SaasFixtureChain): Promise<void> {
  await db.saasEntitlementGrant.deleteMany({ where: { tenantId: chain.tenantId } });
  await db.saasSubscription.deleteMany({ where: { tenantId: chain.tenantId } });
  await db.saasMembership.deleteMany({ where: { tenantId: chain.tenantId } });
  await db.saasWorkspace.deleteMany({ where: { tenantId: chain.tenantId } });
  await db.saasOrganization.deleteMany({ where: { tenantId: chain.tenantId } });
  await db.saasTenant.delete({ where: { id: chain.tenantId } });
  await db.user.delete({ where: { id: chain.userId } });
}
