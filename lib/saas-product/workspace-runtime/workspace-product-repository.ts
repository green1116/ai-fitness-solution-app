import type {
  WorkspaceProductInstance,
  WorkspaceProductInstanceStatus,
} from "../shared/workspace-runtime-types";
import { WORKSPACE_RUNTIME_ERROR_CODES, SaasWorkspaceProductError } from "../shared/workspace-runtime-errors";

const workspaceProducts = new Map<string, WorkspaceProductInstance>();

function cloneInstance(instance: WorkspaceProductInstance): WorkspaceProductInstance {
  return {
    ...instance,
    productDefinition: {
      ...instance.productDefinition,
      workflowKeys: [...instance.productDefinition.workflowKeys],
      portalTypes: [...instance.productDefinition.portalTypes],
      requiredFeatures: [...instance.productDefinition.requiredFeatures],
    },
    productContextSnapshot: {
      ...instance.productContextSnapshot,
      workflowStages: instance.productContextSnapshot.workflowStages.map((stage) => ({
        ...stage,
        stages: [...stage.stages],
        requiredPermissions: [...stage.requiredPermissions],
      })),
      permissions: [...instance.productContextSnapshot.permissions],
      featureFlags: {
        required: { ...instance.productContextSnapshot.featureFlags.required },
        enabled: { ...instance.productContextSnapshot.featureFlags.enabled },
      },
      v47ModuleMapping: {
        productModule: instance.productContextSnapshot.v47ModuleMapping.productModule,
        workflowModules: { ...instance.productContextSnapshot.v47ModuleMapping.workflowModules },
      },
      workspaceBinding: { ...instance.productContextSnapshot.workspaceBinding },
      productDefinition: {
        ...instance.productContextSnapshot.productDefinition,
        workflowKeys: [...instance.productContextSnapshot.productDefinition.workflowKeys],
        portalTypes: [...instance.productContextSnapshot.productDefinition.portalTypes],
        requiredFeatures: [...instance.productContextSnapshot.productDefinition.requiredFeatures],
      },
    },
    v47CustomerWorkspaceMapping: { ...instance.v47CustomerWorkspaceMapping },
    metadata: { ...instance.metadata },
  };
}

export function saveWorkspaceProduct(instance: WorkspaceProductInstance): WorkspaceProductInstance {
  workspaceProducts.set(instance.workspaceProductId, cloneInstance(instance));
  return cloneInstance(instance);
}

export function getWorkspaceProduct(workspaceProductId: string): WorkspaceProductInstance | undefined {
  const record = workspaceProducts.get(workspaceProductId);
  return record ? cloneInstance(record) : undefined;
}

export function listWorkspaceProductsByTenant(tenantId: string): WorkspaceProductInstance[] {
  return [...workspaceProducts.values()]
    .filter((record) => record.tenantId === tenantId)
    .map((record) => cloneInstance(record));
}

export function findWorkspaceProductByBinding(
  tenantId: string,
  workspaceId: string,
  productCode: string,
): WorkspaceProductInstance | undefined {
  const record = [...workspaceProducts.values()].find(
    (item) =>
      item.tenantId === tenantId && item.workspaceId === workspaceId && item.productCode === productCode,
  );
  return record ? cloneInstance(record) : undefined;
}

export function updateWorkspaceProductStatus(
  workspaceProductId: string,
  status: WorkspaceProductInstanceStatus,
): WorkspaceProductInstance {
  const record = workspaceProducts.get(workspaceProductId);
  if (!record) {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_NOT_FOUND,
      `Workspace product not found: ${workspaceProductId}`,
    );
  }
  const next = cloneInstance({ ...record, status, updatedAt: new Date().toISOString() });
  workspaceProducts.set(workspaceProductId, next);
  return cloneInstance(next);
}

export function clearWorkspaceProductRepository(): void {
  workspaceProducts.clear();
}

export function getWorkspaceProductRepositorySize(): number {
  return workspaceProducts.size;
}
