import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  EnterpriseSaasRuntimeResult,
  EnterpriseSaasStageResult,
} from "../shared/types";
import { ENTERPRISE_SAAS_VERSION } from "../shared/types";
import { buildTenant, buildTenantLifecycle, TENANT_TIERS } from "./builders";
import type { TenantRuntimePayload } from "./types";
import { TENANT_RUNTIME_VERSION } from "./types";

export function validateTenantRuntime(input?: { deploymentId?: string }): {
  tenantValid: boolean;
  lifecycleValid: boolean;
  tiersValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "tenant-default";
  const tenant = buildTenant({ deploymentId });
  const lifecycle = buildTenantLifecycle({ deploymentId, tenant });

  return {
    tenantValid:
      tenant.tenantId.length > 0 &&
      tenant.slug.length > 0 &&
      TENANT_TIERS.includes(tenant.tier),
    lifecycleValid:
      lifecycle.length >= 4 &&
      lifecycle.every((event) => event.tenantId === tenant.tenantId),
    tiersValid: TENANT_TIERS.length === 3,
  };
}

export function runTenantRuntime(input?: {
  deploymentId?: string;
}): EnterpriseSaasRuntimeResult<TenantRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "tenant-default";
  const stages: EnterpriseSaasStageResult[] = [];

  const tenant = runStage(
    "tenant-model",
    "Tenant Model",
    () => buildTenant({ deploymentId }),
    stages,
  );
  const lifecycle = runStage(
    "tenant-lifecycle",
    "Tenant Lifecycle",
    () => buildTenantLifecycle({ deploymentId, tenant }),
    stages,
  );

  const validation = runStage(
    "tenant-validate",
    "Tenant Validation",
    () => validateTenantRuntime({ deploymentId }),
    stages,
  );

  if (!Object.values(validation).every(Boolean)) {
    throw new Error("Tenant runtime validation failed");
  }

  const payload: TenantRuntimePayload = {
    version: TENANT_RUNTIME_VERSION,
    saasVersion: ENTERPRISE_SAAS_VERSION,
    tenant,
    lifecycle,
    summary: `tenant-runtime id=${tenant.tenantId} tier=${tenant.tier} status=${tenant.status} lifecycle=${lifecycle.length}`,
  };

  return finalizeRuntime({
    domain: "tenant",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
