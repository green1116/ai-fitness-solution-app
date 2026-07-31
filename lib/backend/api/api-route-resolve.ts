/**
 * PI-3.4 — Resolve existing API routes to filesystem + runtime adapters.
 */
import path from "node:path";

import { classifyApiFamily, type ApiFamilyId } from "./api-families";
import type { RuntimeAdapterBinding } from "../runtime/runtime-bindings";
import { RUNTIME_ADAPTER_BINDINGS } from "../runtime/runtime-bindings";

/** Strip query string from an existing route declaration. */
export function normalizeApiRoutePath(routePath: string): string {
  const bare = routePath.split("?")[0] ?? routePath;
  return bare.replace(/\/+$/, "") || "/";
}

/**
 * Map `/api/...` to `app/api/.../route.ts` (existing App Router layout).
 */
export function apiRouteToAppPath(routePath: string): string {
  const bare = normalizeApiRoutePath(routePath);
  if (!bare.startsWith("/api/")) {
    throw new Error(`Not an /api route: ${routePath}`);
  }
  const relative = bare.slice(1); // api/...
  return path.posix.join("app", relative, "route.ts");
}

/**
 * Preferred runtime adapters for an existing route (PI-3.3 binding ids).
 */
export function adapterIdsForApiRoute(routePath: string): readonly string[] {
  const bare = normalizeApiRoutePath(routePath);
  if (bare.startsWith("/api/v80/tender")) return ["RT-V80-TENDER"];
  if (bare.startsWith("/api/v80/autopilot")) return ["RT-V80-AUTOPILOT"];
  if (bare.startsWith("/api/v80/budget")) return ["RT-V80-BUDGET"];
  if (
    bare.startsWith("/api/v80/pdf") ||
    bare.startsWith("/api/v80/proposal-pdf")
  ) {
    return ["RT-V80-PDF"];
  }
  if (bare.startsWith("/api/v80/tenant")) return ["RT-V80-TENANT"];
  if (
    bare.startsWith("/api/v80/ops") ||
    bare.startsWith("/api/v80/production")
  ) {
    return ["RT-V80-OPS"];
  }
  if (
    bare.startsWith("/api/project") ||
    bare.startsWith("/api/workspace") ||
    bare.startsWith("/api/tender") ||
    bare.startsWith("/api/documents") ||
    bare.startsWith("/api/sales") ||
    bare.startsWith("/api/plan") ||
    bare.startsWith("/api/onboarding") ||
    bare.startsWith("/api/download-token") ||
    bare.startsWith("/api/commercial-delivery") ||
    bare.startsWith("/api/enterprise-saas")
  ) {
    return ["RT-LEGACY-SERVICES"];
  }
  return [];
}

export function adaptersForApiRoute(
  routePath: string,
): RuntimeAdapterBinding[] {
  const ids = new Set(adapterIdsForApiRoute(routePath));
  return RUNTIME_ADAPTER_BINDINGS.filter((row) => ids.has(row.adapterId));
}

export type ResolvedApiRoute = Readonly<{
  route: string;
  normalizedPath: string;
  appPath: string;
  familyId: ApiFamilyId | null;
  adapterIds: readonly string[];
}>;

export function resolveApiRoute(routePath: string): ResolvedApiRoute {
  const normalizedPath = normalizeApiRoutePath(routePath);
  return {
    route: routePath,
    normalizedPath,
    appPath: apiRouteToAppPath(routePath),
    familyId: classifyApiFamily(routePath),
    adapterIds: adapterIdsForApiRoute(routePath),
  };
}
