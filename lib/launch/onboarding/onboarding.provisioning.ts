/**
 * Launch P2 — Tenant Provisioning Workflow
 * Integrates E12 tenant product + admin console
 */

import {
  linkTenantToOrganization,
} from "../../product/e12/admin/admin.tenant";
import {
  getOrganization,
  registerOrganization,
} from "../../product/e12/admin/admin.organization";
import {
  bindSubscription,
} from "../../product/e12/tenant/tenant.subscription";
import {
  registerProductTenant,
  setProductTenantStatus,
} from "../../product/e12/tenant/tenant.product";
import { createWorkspace } from "../../product/e12/tenant/tenant.workspace";
import { PROVISIONING_STEPS } from "./onboarding.constants";
import {
  getOnboardingProfile,
  updateOnboardingProfile,
} from "./onboarding.profile";
import type {
  ProvisioningStep,
  ProvisioningStepRecord,
  StartProvisioningInput,
  TenantProvisioningWorkflow,
} from "./onboarding.types";

const workflows = new Map<string, TenantProvisioningWorkflow>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkflow(
  workflow: TenantProvisioningWorkflow,
): TenantProvisioningWorkflow {
  return {
    ...workflow,
    steps: workflow.steps.map((s) => ({ ...s })),
  };
}

function initialSteps(): ProvisioningStepRecord[] {
  return PROVISIONING_STEPS.map((step) => ({
    step,
    status: "PENDING",
    detail: "pending",
  }));
}

function markStep(
  workflow: TenantProvisioningWorkflow,
  step: ProvisioningStep,
  status: ProvisioningStepRecord["status"],
  detail: string,
): void {
  const record = workflow.steps.find((s) => s.step === step);
  if (!record) return;
  record.status = status;
  record.detail = detail;
  if (status === "COMPLETED" || status === "FAILED") {
    record.completedAt = nowIso();
  }
  workflow.currentStep = step;
  workflow.updatedAt = nowIso();
  workflow.complete = workflow.steps.every((s) => s.status === "COMPLETED");
  workflow.failed = workflow.steps.some((s) => s.status === "FAILED");
}

export function startTenantProvisioning(
  input: StartProvisioningInput,
): TenantProvisioningWorkflow {
  const onboardingProfileId = input.onboardingProfileId.trim();
  const profile = getOnboardingProfile(onboardingProfileId);
  if (!profile) {
    throw new Error(`onboarding profile not found: ${onboardingProfileId}`);
  }

  const id = input.id?.trim() || createId("prov");
  if (workflows.has(id)) throw new Error(`provisioning workflow already exists: ${id}`);

  const workflow: TenantProvisioningWorkflow = {
    id,
    onboardingProfileId,
    steps: initialSteps(),
    complete: false,
    failed: false,
    updatedAt: nowIso(),
  };
  workflows.set(id, workflow);
  updateOnboardingProfile(onboardingProfileId, { status: "PROVISIONING" });

  try {
    // CREATE_WORKSPACE
    markStep(workflow, "CREATE_WORKSPACE", "RUNNING", "creating workspace");
    const slugBase =
      input.workspaceSlug?.trim().toLowerCase() ||
      profile.customerName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const workspace = createWorkspace({
      id: `${id}.workspace`,
      name: input.workspaceName?.trim() || `${profile.customerName} Workspace`,
      slug: `${slugBase}-${Date.now().toString(36).slice(-4)}`,
    });
    markStep(
      workflow,
      "CREATE_WORKSPACE",
      "COMPLETED",
      `workspace=${workspace.id}`,
    );
    updateOnboardingProfile(onboardingProfileId, {
      workspaceId: workspace.id,
    });

    // REGISTER_TENANT
    markStep(workflow, "REGISTER_TENANT", "RUNNING", "registering tenant");
    const tenant = registerProductTenant({
      id: `${id}.tenant`,
      name: input.tenantName?.trim() || `${profile.customerName} Tenant`,
      productId: profile.productId,
      workspaceId: workspace.id,
      organizationId: profile.organizationId,
    });
    markStep(
      workflow,
      "REGISTER_TENANT",
      "COMPLETED",
      `tenant=${tenant.id}`,
    );
    updateOnboardingProfile(onboardingProfileId, {
      productTenantId: tenant.id,
    });

    // LINK_ORGANIZATION
    markStep(workflow, "LINK_ORGANIZATION", "RUNNING", "linking organization");
    let organizationId = profile.organizationId;
    if (!organizationId || !getOrganization(organizationId)) {
      const org = registerOrganization({
        id: `${id}.org`,
        name: profile.customerName,
        slug:
          input.organizationSlug?.trim().toLowerCase() ||
          `${slugBase}-org-${Date.now().toString(36).slice(-4)}`,
        productId: profile.productId,
      });
      organizationId = org.id;
    }
    linkTenantToOrganization(tenant.id, organizationId);
    markStep(
      workflow,
      "LINK_ORGANIZATION",
      "COMPLETED",
      `organization=${organizationId}`,
    );
    updateOnboardingProfile(onboardingProfileId, { organizationId });

    // BIND_SUBSCRIPTION
    markStep(workflow, "BIND_SUBSCRIPTION", "RUNNING", "binding subscription");
    const sub = bindSubscription({
      id: `${id}.sub`,
      productTenantId: tenant.id,
      productId: profile.productId,
      editionId: input.editionId.trim(),
      packageId: input.packageId?.trim(),
    });
    markStep(
      workflow,
      "BIND_SUBSCRIPTION",
      "COMPLETED",
      `subscription=${sub.id}`,
    );

    // ACTIVATE_TENANT
    markStep(workflow, "ACTIVATE_TENANT", "RUNNING", "activating tenant");
    setProductTenantStatus(tenant.id, "ACTIVE");
    markStep(workflow, "ACTIVATE_TENANT", "COMPLETED", "tenant ACTIVE");

    updateOnboardingProfile(onboardingProfileId, { status: "CONFIGURING" });
    workflows.set(id, workflow);
    return cloneWorkflow(workflow);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "provisioning failed";
    if (workflow.currentStep) {
      markStep(workflow, workflow.currentStep, "FAILED", detail);
    }
    updateOnboardingProfile(onboardingProfileId, { status: "FAILED" });
    workflows.set(id, workflow);
    throw error;
  }
}

export function getTenantProvisioningWorkflow(
  id: string,
): TenantProvisioningWorkflow | undefined {
  const workflow = workflows.get(id.trim());
  return workflow ? cloneWorkflow(workflow) : undefined;
}

export function listTenantProvisioningWorkflows(filter?: {
  onboardingProfileId?: string;
}): TenantProvisioningWorkflow[] {
  let result = [...workflows.values()];
  if (filter?.onboardingProfileId) {
    const oid = filter.onboardingProfileId.trim();
    result = result.filter((w) => w.onboardingProfileId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkflow);
}

export function clearTenantProvisioningWorkflows(): void {
  workflows.clear();
}
