/**
 * V60 P4 — Multi-tenant deployment engine
 */

import type { DeploymentEnvironment, TenantDeployment, VerticalIndustry } from "../expansion.types";
import { loadIndustryTemplate, registerVerticalIndustry } from "../verticals/vertical.registry";
import { resolveTemplateBundle } from "../templates/template.engine";
import { createCustomBranding } from "../white-label/branding.engine";
import { getEnvironmentConfig } from "./environment.manager";

declare global {
  // eslint-disable-next-line no-var
  var __tenantDeployments: Map<string, TenantDeployment> | undefined;
}

function getDeploymentStore(): Map<string, TenantDeployment> {
  globalThis.__tenantDeployments ||= new Map();
  return globalThis.__tenantDeployments;
}

export function deployTenantInstance(input: {
  organizationId: string;
  vertical: VerticalIndustry;
  environment?: DeploymentEnvironment;
  branding?: { companyName: string; logoUrl?: string; domain?: string };
}): TenantDeployment {
  const envConfig = getEnvironmentConfig(input.environment);
  registerVerticalIndustry(input.vertical);
  const templates = resolveTemplateBundle(input.vertical);

  if (input.branding) {
    createCustomBranding({
      organizationId: input.organizationId,
      companyName: input.branding.companyName,
      logoUrl: input.branding.logoUrl,
      domain: input.branding.domain,
    });
  }

  const deployment: TenantDeployment = {
    deploymentId: `dep_${input.organizationId.slice(0, 8)}_${Date.now().toString(36)}`,
    organizationId: input.organizationId,
    vertical: input.vertical,
    environment: envConfig.environment,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  getDeploymentStore().set(deployment.deploymentId, deployment);

  void templates;
  return deployment;
}

export function getTenantDeployment(deploymentId: string): TenantDeployment | undefined {
  return getDeploymentStore().get(deploymentId);
}

export function listDeploymentsForOrganization(organizationId: string): TenantDeployment[] {
  return [...getDeploymentStore().values()].filter((d) => d.organizationId === organizationId);
}

export function clearDeploymentsForTests(): void {
  globalThis.__tenantDeployments = new Map();
}
