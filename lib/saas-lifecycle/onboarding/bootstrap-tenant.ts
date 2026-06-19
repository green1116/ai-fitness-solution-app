import { prisma } from "@/lib/prisma";
import { createOrganization } from "../organization/create-organization";
import { createOwnerMembership } from "../membership/create-owner-membership";
import { bootstrapTrialSubscription } from "../subscription/bootstrap-trial-subscription";
import {
  SaasLifecycleError,
  SAAS_LIFECYCLE_ERROR_CODES,
  SAAS_LIFECYCLE_P3_TAG,
} from "../shared/constants";
import type { BootstrapTenantInput, BootstrapTenantResult } from "../shared/types";
import { createTenant, validateBootstrapTenantInput } from "../tenant/create-tenant";
import { createWorkspace } from "../workspace/create-workspace";

export async function bootstrapTenant(input: BootstrapTenantInput): Promise<BootstrapTenantResult> {
  validateBootstrapTenantInput(input);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await createTenant(tx, {
        name: input.tenantName,
        portalType: input.portalType,
        status: "active",
      });

      const organization = await createOrganization(tx, {
        tenantId: tenant.id,
        name: input.organizationName,
      });

      const workspace = await createWorkspace(tx, {
        tenantId: tenant.id,
        organizationId: organization.id,
        name: input.workspaceName,
      });

      const membership = await createOwnerMembership(tx, {
        tenantId: tenant.id,
        organizationId: organization.id,
        workspaceId: workspace.id,
        userId: input.userId,
      });

      const subscription = await bootstrapTrialSubscription(tx, {
        tenantId: tenant.id,
      });

      return {
        tenantId: tenant.id,
        organizationId: organization.id,
        workspaceId: workspace.id,
        membershipId: membership.id,
        subscriptionId: subscription.id,
      };
    });

    return result;
  } catch (error) {
    if (error instanceof SaasLifecycleError) throw error;
    throw new SaasLifecycleError(
      SAAS_LIFECYCLE_ERROR_CODES.BOOTSTRAP_FAILED,
      error instanceof Error ? error.message : "bootstrapTenant failed",
    );
  }
}

export function getBootstrapTenantMeta() {
  return {
    lifecycleId: "saas-lifecycle-bootstrap-v48-p3",
    tag: SAAS_LIFECYCLE_P3_TAG,
  };
}
