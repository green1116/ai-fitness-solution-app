import type {
  BindWorkspaceProductInput,
  CreateProductWorkspaceInput,
  WorkspaceProductInstance,
  WorkspaceProductMetadata,
  WorkspaceProductInstanceStatus,
} from "../shared/workspace-runtime-types";
import type { ProductContext } from "../shared/context-types";
import { WORKSPACE_RUNTIME_ERROR_CODES, SaasWorkspaceProductError } from "../shared/workspace-runtime-errors";
import {
  findWorkspaceProductByBinding,
  getWorkspaceProduct,
  listWorkspaceProductsByTenant,
  saveWorkspaceProduct,
} from "./workspace-product-repository";
import {
  assertValidProductContextForWorkspace,
  assertValidWorkspaceProductStatus,
  validateWorkspaceProductInstance,
} from "./workspace-product-validation";
import {
  buildV47CustomerWorkspaceMapping,
  mapSaasWorkspaceToV47CustomerWorkspace,
} from "./workspace-product-mapper";

function generateWorkspaceProductId(): string {
  return `ws-product-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildMetadata(context: ProductContext, metadata?: WorkspaceProductMetadata): WorkspaceProductMetadata {
  return {
    portalType: context.portalType,
    roleSystemCode: context.roleSystemCode,
    organizationId: context.organizationId,
    createdByUserId: context.userId,
    ...metadata,
  };
}

function buildWorkspaceProductInstance(
  context: ProductContext,
  status: WorkspaceProductInstanceStatus,
  metadata?: WorkspaceProductMetadata,
  workspaceProductId?: string,
): WorkspaceProductInstance {
  const now = new Date().toISOString();
  const v47CustomerWorkspaceMapping = buildV47CustomerWorkspaceMapping(context);

  return {
    workspaceProductId: workspaceProductId ?? generateWorkspaceProductId(),
    tenantId: context.tenantId,
    workspaceId: context.workspaceId,
    productCode: context.productCode,
    productDefinition: context.productDefinition,
    productContextSnapshot: context,
    v47CustomerWorkspaceMapping,
    status,
    createdAt: now,
    updatedAt: now,
    metadata: buildMetadata(context, metadata),
  };
}

export function createProductWorkspace(input: CreateProductWorkspaceInput): WorkspaceProductInstance {
  assertValidProductContextForWorkspace(input.context);
  const status = input.status ?? "draft";
  assertValidWorkspaceProductStatus(status);

  const existing = findWorkspaceProductByBinding(
    input.context.tenantId,
    input.context.workspaceId,
    input.context.productCode,
  );
  if (existing && existing.status !== "archived") {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_ALREADY_EXISTS,
      `Workspace product already exists: ${existing.workspaceProductId}`,
    );
  }

  const instance = buildWorkspaceProductInstance(input.context, status, input.metadata);
  if (!validateWorkspaceProductInstance(instance)) {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_MAPPING_INVALID,
      "Failed to validate workspace product instance",
    );
  }

  return saveWorkspaceProduct(instance);
}

export function resolveWorkspaceProduct(workspaceProductId: string): WorkspaceProductInstance {
  const record = getWorkspaceProduct(workspaceProductId);
  if (!record) {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_NOT_FOUND,
      `Workspace product not found: ${workspaceProductId}`,
    );
  }
  return record;
}

export function listWorkspaceProducts(tenantId: string): WorkspaceProductInstance[] {
  if (!tenantId?.trim()) {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_CONTEXT_INVALID,
      "tenantId is required to list workspace products",
    );
  }
  return listWorkspaceProductsByTenant(tenantId);
}

export function bindWorkspaceProduct(input: BindWorkspaceProductInput): WorkspaceProductInstance {
  assertValidProductContextForWorkspace(input.context);

  const existing = resolveWorkspaceProduct(input.workspaceProductId);
  if (existing.tenantId !== input.context.tenantId) {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_TENANT_MISMATCH,
      `Tenant mismatch for workspace product ${input.workspaceProductId}`,
    );
  }

  const status = input.status ?? existing.status;
  assertValidWorkspaceProductStatus(status);

  const next = buildWorkspaceProductInstance(
    input.context,
    status,
    { ...existing.metadata, ...buildMetadata(input.context) },
    existing.workspaceProductId,
  );
  next.createdAt = existing.createdAt;

  if (!validateWorkspaceProductInstance(next)) {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_MAPPING_INVALID,
      "Failed to validate bound workspace product instance",
    );
  }

  return saveWorkspaceProduct(next);
}

export {
  mapSaasWorkspaceToV47CustomerWorkspace,
  buildV47CustomerWorkspaceMapping,
  validateV47CustomerWorkspaceMapping,
} from "./workspace-product-mapper";

export {
  clearWorkspaceProductRepository,
  getWorkspaceProductRepositorySize,
} from "./workspace-product-repository";

export {
  assertValidProductContextForWorkspace,
  validateWorkspaceProductInstance,
} from "./workspace-product-validation";
