-- V48 Production SaaS Foundation — Phase 1
-- Tag: v48-saas-foundation-p1
-- Create-only migration (no destructive changes to legacy tables)

CREATE TABLE "saas_tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "portalType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_organization" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orgType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_workspace" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspaceType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_workspace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_role" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "systemCode" TEXT,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "portalType" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saas_permission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_membership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_membership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_role_permission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "saas_role_permission_pkey" PRIMARY KEY ("roleId","permissionId")
);

CREATE TABLE "saas_plan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceMonthly" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL,
    "quotas" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_plan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'trialing',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_entitlement_grant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "quota" INTEGER,
    "used" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'subscription',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_entitlement_grant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saas_tenant_slug_key" ON "saas_tenant"("slug");
CREATE INDEX "saas_tenant_status_idx" ON "saas_tenant"("status");
CREATE INDEX "saas_tenant_portalType_idx" ON "saas_tenant"("portalType");

CREATE INDEX "saas_organization_tenantId_idx" ON "saas_organization"("tenantId");
CREATE INDEX "saas_organization_tenantId_orgType_idx" ON "saas_organization"("tenantId", "orgType");

CREATE INDEX "saas_workspace_tenantId_idx" ON "saas_workspace"("tenantId");
CREATE INDEX "saas_workspace_organizationId_idx" ON "saas_workspace"("organizationId");
CREATE INDEX "saas_workspace_tenantId_organizationId_idx" ON "saas_workspace"("tenantId", "organizationId");

CREATE UNIQUE INDEX "saas_role_systemCode_key" ON "saas_role"("systemCode");
CREATE INDEX "saas_role_tenantId_idx" ON "saas_role"("tenantId");
CREATE INDEX "saas_role_portalType_idx" ON "saas_role"("portalType");

CREATE UNIQUE INDEX "saas_permission_key_key" ON "saas_permission"("key");
CREATE INDEX "saas_permission_resource_idx" ON "saas_permission"("resource");

CREATE UNIQUE INDEX "saas_membership_workspaceId_userId_key" ON "saas_membership"("workspaceId", "userId");
CREATE INDEX "saas_membership_tenantId_idx" ON "saas_membership"("tenantId");
CREATE INDEX "saas_membership_organizationId_idx" ON "saas_membership"("organizationId");
CREATE INDEX "saas_membership_userId_idx" ON "saas_membership"("userId");
CREATE INDEX "saas_membership_tenantId_organizationId_idx" ON "saas_membership"("tenantId", "organizationId");

CREATE UNIQUE INDEX "saas_plan_code_key" ON "saas_plan"("code");

CREATE UNIQUE INDEX "saas_subscription_tenantId_key" ON "saas_subscription"("tenantId");
CREATE INDEX "saas_subscription_status_idx" ON "saas_subscription"("status");
CREATE INDEX "saas_subscription_currentPeriodEnd_idx" ON "saas_subscription"("currentPeriodEnd");

CREATE UNIQUE INDEX "saas_entitlement_grant_tenantId_feature_key" ON "saas_entitlement_grant"("tenantId", "feature");
CREATE INDEX "saas_entitlement_grant_tenantId_idx" ON "saas_entitlement_grant"("tenantId");

ALTER TABLE "saas_organization" ADD CONSTRAINT "saas_organization_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saas_workspace" ADD CONSTRAINT "saas_workspace_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saas_workspace" ADD CONSTRAINT "saas_workspace_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "saas_organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saas_membership" ADD CONSTRAINT "saas_membership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saas_membership" ADD CONSTRAINT "saas_membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "saas_organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saas_membership" ADD CONSTRAINT "saas_membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "saas_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saas_membership" ADD CONSTRAINT "saas_membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saas_membership" ADD CONSTRAINT "saas_membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "saas_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "saas_role_permission" ADD CONSTRAINT "saas_role_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "saas_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saas_role_permission" ADD CONSTRAINT "saas_role_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "saas_permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saas_subscription" ADD CONSTRAINT "saas_subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saas_subscription" ADD CONSTRAINT "saas_subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "saas_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "saas_entitlement_grant" ADD CONSTRAINT "saas_entitlement_grant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
