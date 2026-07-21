/**
 * Launch P7 — Launch Orchestration Model
 * Binds production / onboarding / demo / security / SLA / documentation
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getDemoTenant } from "../demo/demo.tenant";
import { getDocumentationPackage } from "../documentation/documentation.package";
import { getProductionProfile } from "../launch.profile";
import { getOnboardingProfile } from "../onboarding/onboarding.profile";
import { getSecurityProfile } from "../security/security.profile";
import { getSupportSlaProfile } from "../support/support.profile";
import {
  ORCHESTRATION_STAGES,
  ORCHESTRATION_STATUSES,
} from "./control.constants";
import type {
  CreateLaunchOrchestrationInput,
  LaunchOrchestration,
  OrchestrationStage,
  OrchestrationStageRecord,
  OrchestrationStatus,
} from "./control.types";

const orchestrations = new Map<string, LaunchOrchestration>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOrchestration(
  orchestration: LaunchOrchestration,
): LaunchOrchestration {
  return {
    ...orchestration,
    stages: orchestration.stages.map((s) => ({ ...s })),
    metadata: { ...orchestration.metadata },
  };
}

function buildStages(
  input: CreateLaunchOrchestrationInput,
): OrchestrationStageRecord[] {
  const bindings: Array<{
    stage: OrchestrationStage;
    refId?: string;
    present: boolean;
  }> = [
    {
      stage: "PRODUCTION",
      refId: input.productionProfileId,
      present: true,
    },
    {
      stage: "ONBOARDING",
      refId: input.onboardingProfileId,
      present: !!input.onboardingProfileId,
    },
    {
      stage: "DEMO",
      refId: input.demoTenantId,
      present: !!input.demoTenantId,
    },
    {
      stage: "SECURITY",
      refId: input.securityProfileId,
      present: !!input.securityProfileId,
    },
    {
      stage: "SLA",
      refId: input.supportSlaProfileId,
      present: !!input.supportSlaProfileId,
    },
    {
      stage: "DOCUMENTATION",
      refId: input.documentationPackageId,
      present: !!input.documentationPackageId,
    },
    {
      stage: "GO_LIVE",
      present: true,
    },
  ];

  return bindings.map((b) => ({
    stage: b.stage,
    status: b.present ? "PENDING" : "SKIPPED",
    detail: b.present
      ? b.refId
        ? `bound=${b.refId}`
        : "awaiting evaluation"
      : "not bound",
    refId: b.refId,
  }));
}

export function createLaunchOrchestration(
  input: CreateLaunchOrchestrationInput,
): LaunchOrchestration {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const productionProfileId = input.productionProfileId.trim();

  if (!name) throw new Error("orchestration.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const production = getProductionProfile(productionProfileId);
  if (!production || production.productId !== productId) {
    throw new Error(
      `production profile not found for product: ${productionProfileId}`,
    );
  }

  if (input.onboardingProfileId) {
    const onboarding = getOnboardingProfile(input.onboardingProfileId.trim());
    if (!onboarding || onboarding.productId !== productId) {
      throw new Error(
        `onboarding profile not found: ${input.onboardingProfileId}`,
      );
    }
  }

  if (input.demoTenantId) {
    const demo = getDemoTenant(input.demoTenantId.trim());
    if (!demo || demo.productId !== productId) {
      throw new Error(`demo tenant not found: ${input.demoTenantId}`);
    }
  }

  if (input.securityProfileId) {
    const security = getSecurityProfile(input.securityProfileId.trim());
    if (!security || security.productId !== productId) {
      throw new Error(`security profile not found: ${input.securityProfileId}`);
    }
  }

  if (input.supportSlaProfileId) {
    const support = getSupportSlaProfile(input.supportSlaProfileId.trim());
    if (!support || support.productId !== productId) {
      throw new Error(
        `support sla profile not found: ${input.supportSlaProfileId}`,
      );
    }
  }

  if (input.documentationPackageId) {
    const docs = getDocumentationPackage(input.documentationPackageId.trim());
    if (!docs || docs.productId !== productId) {
      throw new Error(
        `documentation package not found: ${input.documentationPackageId}`,
      );
    }
  }

  const deploymentPackageId =
    input.deploymentPackageId?.trim() || production.deploymentPackageId;
  if (deploymentPackageId) {
    const depl = getDeploymentPackage(deploymentPackageId);
    if (!depl || depl.productId !== productId) {
      throw new Error(`deployment package not found: ${deploymentPackageId}`);
    }
  }

  const status = input.status ?? "DRAFT";
  if (!(ORCHESTRATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid orchestration status: ${status}`);
  }

  const id = input.id?.trim() || createId("orch");
  if (orchestrations.has(id)) {
    throw new Error(`launch orchestration already exists: ${id}`);
  }

  const now = nowIso();
  const orchestration: LaunchOrchestration = {
    id,
    name,
    productId,
    productionProfileId,
    onboardingProfileId: input.onboardingProfileId?.trim() || undefined,
    demoTenantId: input.demoTenantId?.trim() || undefined,
    securityProfileId: input.securityProfileId?.trim() || undefined,
    supportSlaProfileId: input.supportSlaProfileId?.trim() || undefined,
    documentationPackageId: input.documentationPackageId?.trim() || undefined,
    deploymentPackageId,
    status,
    stages: buildStages({
      ...input,
      productionProfileId,
      deploymentPackageId,
    }),
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  orchestrations.set(id, orchestration);
  return cloneOrchestration(orchestration);
}

export function getLaunchOrchestration(
  id: string,
): LaunchOrchestration | undefined {
  const orchestration = orchestrations.get(id.trim());
  return orchestration ? cloneOrchestration(orchestration) : undefined;
}

export function listLaunchOrchestrations(filter?: {
  productId?: string;
  status?: OrchestrationStatus;
}): LaunchOrchestration[] {
  let result = [...orchestrations.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((o) => o.productId === pid);
  }
  if (filter?.status) result = result.filter((o) => o.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOrchestration);
}

export function setOrchestrationStatus(
  id: string,
  status: OrchestrationStatus,
): LaunchOrchestration {
  const orchestration = orchestrations.get(id.trim());
  if (!orchestration) throw new Error(`orchestration not found: ${id}`);
  if (!(ORCHESTRATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid orchestration status: ${status}`);
  }
  orchestration.status = status;
  orchestration.updatedAt = nowIso();
  orchestrations.set(orchestration.id, orchestration);
  return cloneOrchestration(orchestration);
}

export function updateOrchestrationStage(
  orchestrationId: string,
  stage: OrchestrationStage,
  patch: Partial<Pick<OrchestrationStageRecord, "status" | "detail">>,
): LaunchOrchestration {
  const orchestration = orchestrations.get(orchestrationId.trim());
  if (!orchestration) {
    throw new Error(`orchestration not found: ${orchestrationId}`);
  }
  if (!(ORCHESTRATION_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid orchestration stage: ${stage}`);
  }
  const record = orchestration.stages.find((s) => s.stage === stage);
  if (!record) throw new Error(`stage not found: ${stage}`);
  if (patch.status) record.status = patch.status;
  if (patch.detail !== undefined) record.detail = patch.detail;
  orchestration.updatedAt = nowIso();
  orchestrations.set(orchestration.id, orchestration);
  return cloneOrchestration(orchestration);
}

export function clearLaunchOrchestrations(): void {
  orchestrations.clear();
}
