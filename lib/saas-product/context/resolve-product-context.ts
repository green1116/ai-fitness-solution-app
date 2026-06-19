import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { resolvePermissions } from "@/lib/saas-rbac/permission/permission-resolver";
import { bindProductContext } from "./product-context";
import { bindTenantContext } from "./tenant-context";
import { bindWorkspaceContext } from "./workspace-context";
import type { ProductContext } from "../shared/context-types";
import type { ProductCode } from "../shared/product-types";

export function resolveProductContext(ctx: TenantContext, productCode: ProductCode): ProductContext {
  const tenant = bindTenantContext(ctx);
  const product = bindProductContext(tenant.tenantId, productCode, tenant.portalType);
  const workspace = bindWorkspaceContext({
    workspaceId: ctx.workspaceId,
    productCode,
    portalType: tenant.portalType,
  });

  const permissions = resolvePermissions(ctx);

  return {
    tenantId: tenant.tenantId,
    organizationId: tenant.organizationId,
    workspaceId: workspace.workspaceId,
    userId: tenant.userId,
    portalType: tenant.portalType,
    roleSystemCode: tenant.roleSystemCode,
    productCode: product.productCode,
    productDefinition: product.productDefinition,
    workflowStages: product.workflowStages,
    workspaceBinding: workspace.workspaceBinding,
    v47ModuleMapping: product.v47ModuleMapping,
    permissions,
    featureFlags: product.featureFlags,
    source: {
      tenantContextVersion: "v48-saas-runtime-p2",
      productRegistryVersion: "v49-saas-product-p1",
      resolver: "resolveProductContext",
      resolvedAt: new Date().toISOString(),
    },
  };
}
