/**
 * E12-P6 — Enterprise Configuration
 */

import { DEPLOYMENT_CONFIG_SCOPES } from "./deployment.constants";
import { getDeploymentPackage } from "./deployment.package";
import { getEnvironmentProfile } from "./deployment.environment";
import type {
  DeploymentConfigScope,
  EnterpriseDeploymentConfig,
  SetEnterpriseDeploymentConfigInput,
} from "./deployment.types";

const configs = new Map<string, EnterpriseDeploymentConfig>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function configKey(
  deploymentPackageId: string,
  scope: DeploymentConfigScope,
  key: string,
  environmentProfileId?: string,
): string {
  return [
    deploymentPackageId,
    scope,
    environmentProfileId ?? "",
    key,
  ].join(":");
}

function cloneConfig(config: EnterpriseDeploymentConfig): EnterpriseDeploymentConfig {
  return { ...config, metadata: { ...config.metadata } };
}

export function setEnterpriseDeploymentConfig(
  input: SetEnterpriseDeploymentConfigInput,
): EnterpriseDeploymentConfig {
  const deploymentPackageId = input.deploymentPackageId.trim();
  const key = input.key.trim();
  const scope = input.scope;

  if (!key) throw new Error("config.key is required");
  if (!getDeploymentPackage(deploymentPackageId)) {
    throw new Error(`deployment package not found: ${deploymentPackageId}`);
  }
  if (!(DEPLOYMENT_CONFIG_SCOPES as readonly string[]).includes(scope)) {
    throw new Error(`invalid config scope: ${scope}`);
  }

  if (scope === "ENVIRONMENT") {
    const envId = input.environmentProfileId?.trim();
    if (!envId || !getEnvironmentProfile(envId)) {
      throw new Error(`environment profile required: ${envId}`);
    }
  }

  const mapKey = configKey(
    deploymentPackageId,
    scope,
    key,
    input.environmentProfileId,
  );
  const existing = configs.get(mapKey);

  const config: EnterpriseDeploymentConfig = {
    id: existing?.id ?? input.id?.trim() ?? createId("deplcfg"),
    deploymentPackageId,
    environmentProfileId: input.environmentProfileId?.trim() || undefined,
    scope,
    key,
    value: input.value,
    metadata: { ...(input.metadata ?? {}) },
    updatedAt: nowIso(),
  };
  configs.set(mapKey, config);
  return cloneConfig(config);
}

export function getEnterpriseDeploymentConfig(input: {
  deploymentPackageId: string;
  scope: DeploymentConfigScope;
  key: string;
  environmentProfileId?: string;
}): EnterpriseDeploymentConfig | undefined {
  const mapKey = configKey(
    input.deploymentPackageId.trim(),
    input.scope,
    input.key.trim(),
    input.environmentProfileId,
  );
  const config = configs.get(mapKey);
  return config ? cloneConfig(config) : undefined;
}

export function listEnterpriseDeploymentConfigs(filter?: {
  deploymentPackageId?: string;
  environmentProfileId?: string;
  scope?: DeploymentConfigScope;
}): EnterpriseDeploymentConfig[] {
  let result = [...configs.values()];
  if (filter?.deploymentPackageId) {
    const pid = filter.deploymentPackageId.trim();
    result = result.filter((c) => c.deploymentPackageId === pid);
  }
  if (filter?.environmentProfileId) {
    const eid = filter.environmentProfileId.trim();
    result = result.filter((c) => c.environmentProfileId === eid);
  }
  if (filter?.scope) result = result.filter((c) => c.scope === filter.scope);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneConfig);
}

export function clearEnterpriseDeploymentConfigs(): void {
  configs.clear();
}
