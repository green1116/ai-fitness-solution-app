import type {
  PortalContext,
  PortalRouteEntry,
  PortalRouteResolution,
  PortalRoutingMap,
} from "../shared/portal-runtime-types";
import { PORTAL_RUNTIME_ERROR_CODES, SaasPortalRuntimeError } from "../shared/portal-runtime-errors";

export const PORTAL_ROUTE_PATTERNS = {
  product: /^\/product\/([^/]+)$/,
  workspace: /^\/workspace\/([^/]+)$/,
  workflow: /^\/workflow\/([^/]+)$/,
} as const;

export function buildPortalRoutingMap(context: PortalContext): PortalRoutingMap {
  const routes: PortalRouteEntry[] = [
    {
      pattern: "/workspace/:id",
      routeType: "workspace",
      paramName: "id",
      logicalPath: `/workspace/${context.workspaceId}`,
    },
  ];

  for (const product of context.workspaceProducts) {
    routes.push({
      pattern: "/product/:id",
      routeType: "product",
      paramName: "id",
      logicalPath: `/product/${product.workspaceProductId}`,
    });
  }

  for (const workflow of context.workflows) {
    routes.push({
      pattern: "/workflow/:id",
      routeType: "workflow",
      paramName: "id",
      logicalPath: `/workflow/${workflow.workflowId}`,
    });
  }

  return { routes };
}

function matchRoute(path: string): {
  routeType: PortalRouteResolution["routeType"];
  params: Record<string, string>;
} {
  const normalized = path.trim();

  const workspaceMatch = normalized.match(PORTAL_ROUTE_PATTERNS.workspace);
  if (workspaceMatch) {
    return { routeType: "workspace", params: { id: workspaceMatch[1] } };
  }

  const productMatch = normalized.match(PORTAL_ROUTE_PATTERNS.product);
  if (productMatch) {
    return { routeType: "product", params: { id: productMatch[1] } };
  }

  const workflowMatch = normalized.match(PORTAL_ROUTE_PATTERNS.workflow);
  if (workflowMatch) {
    return { routeType: "workflow", params: { id: workflowMatch[1] } };
  }

  return { routeType: "unknown", params: {} };
}

export function resolvePortalRoute(path: string, context: PortalContext): PortalRouteResolution {
  const { routeType, params } = matchRoute(path);

  if (routeType === "unknown") {
    return {
      routeType: "unknown",
      path,
      params,
      matched: false,
    };
  }

  if (routeType === "workspace") {
    const workspaceId = params.id;
    const matched = workspaceId === context.workspaceId;
    if (!matched) {
      throw new SaasPortalRuntimeError(
        PORTAL_RUNTIME_ERROR_CODES.PORTAL_ROUTE_INVALID,
        `Workspace route does not match portal context: ${workspaceId}`,
      );
    }
    return {
      routeType,
      path,
      params,
      matched: true,
      workspaceId,
    };
  }

  if (routeType === "product") {
    const workspaceProductId = params.id;
    const product = context.workspaceProducts.find((item) => item.workspaceProductId === workspaceProductId);
    if (!product) {
      throw new SaasPortalRuntimeError(
        PORTAL_RUNTIME_ERROR_CODES.PORTAL_PRODUCT_NOT_FOUND,
        `Product route not found in portal context: ${workspaceProductId}`,
      );
    }
    return {
      routeType,
      path,
      params,
      matched: true,
      workspaceProductId,
      workspaceId: product.workspaceId,
    };
  }

  const workflowId = params.id;
  const workflow = context.workflows.find((item) => item.workflowId === workflowId);
  if (!workflow) {
    throw new SaasPortalRuntimeError(
      PORTAL_RUNTIME_ERROR_CODES.PORTAL_WORKFLOW_NOT_FOUND,
      `Workflow route not found in portal context: ${workflowId}`,
    );
  }

  return {
    routeType,
    path,
    params,
    matched: true,
    workflowId,
    workspaceProductId: workflow.workspaceProductId,
    workspaceId: context.workspaceId,
  };
}
