/**
 * PI-3.3 — L2 runtime adapter bindings (existing modules under M ownership).
 * Does not invent APIs/Domains or relocate runtime code.
 */
import type { ProductDomainId } from "../foundation/domain-ownership";
import type { BackendServiceId } from "../foundation/service-catalogue";
import type { RuntimeSurfaceId } from "./runtime-surfaces";

export const RUNTIME_BINDING_LAYER_ID =
  "product-backend-runtime-bindings-v1" as const;

export type RuntimeAdapterBinding = Readonly<{
  adapterId: string;
  modulePath: string;
  ownerDomains: readonly ProductDomainId[];
  surfaces: readonly RuntimeSurfaceId[];
  notes: string;
}>;

/**
 * Existing L2 adapters — path references only.
 */
export const RUNTIME_ADAPTER_BINDINGS = [
  {
    adapterId: "RT-V80-TENDER",
    modulePath: "lib/scaffold/v80/services/tender-intake.service.ts",
    ownerDomains: ["M11"],
    surfaces: ["DOM-TENDER"],
    notes: "v80 tender intake",
  },
  {
    adapterId: "RT-V80-AUTOPILOT",
    modulePath: "lib/scaffold/v80/routes/autopilot-job.route.ts",
    ownerDomains: ["M12"],
    surfaces: ["DOM-AUTOPILOT"],
    notes: "v80 autopilot job run",
  },
  {
    adapterId: "RT-V80-BUDGET",
    modulePath: "lib/scaffold/v80/services/budget.service.ts",
    ownerDomains: ["M14"],
    surfaces: ["DOM-BUDGET", "DOM-PLAN"],
    notes: "v80 budget calculate",
  },
  {
    adapterId: "RT-V80-PDF",
    modulePath: "lib/scaffold/v80/pdf/artifact.service.ts",
    ownerDomains: ["M11", "M14"],
    surfaces: ["DOM-PDF", "DOM-PROPOSAL"],
    notes: "v80 pdf / proposal artifacts",
  },
  {
    adapterId: "RT-V80-TENANT",
    modulePath: "lib/scaffold/v80/services/tenant.service.ts",
    ownerDomains: ["M13"],
    surfaces: ["DOM-TENANT"],
    notes: "v80 tenant run",
  },
  {
    adapterId: "RT-V80-OPS",
    modulePath: "lib/scaffold/v80/ops/governance.ts",
    ownerDomains: ["M13", "M15"],
    surfaces: ["DOM-OPS"],
    notes: "v80 ops / governance",
  },
  {
    adapterId: "RT-LEGACY-SERVICES",
    modulePath: "lib/services",
    ownerDomains: ["M11", "M13", "M14"],
    surfaces: ["DOM-TENDER", "DOM-PROJECT", "DOM-BUDGET"],
    notes: "Legacy lib/services orchestrators — not product Domains",
  },
] as const satisfies readonly RuntimeAdapterBinding[];

/** Service → preferred runtime surfaces (aligns with PI-3.2 SVC bias). */
export const SERVICE_RUNTIME_SURFACES: Record<
  BackendServiceId,
  readonly RuntimeSurfaceId[]
> = {
  "SVC-ACCESS": ["DOM-AUTH", "DOM-PREF"],
  "SVC-PROJECT": ["DOM-PROJECT", "DOM-TENANT"],
  "SVC-KNOWLEDGE-INTAKE": ["DOM-TENDER"],
  "SVC-DOCUMENT": ["DOM-DOCS", "DOM-PDF"],
  "SVC-AGENT": ["DOM-AUTOPILOT", "DOM-TENANT"],
  "SVC-INTELLIGENCE": ["DOM-PLAN", "DOM-BUDGET", "DOM-PROPOSAL", "DOM-SALES"],
  "SVC-EVOLUTION": ["DOM-DOCS", "DOM-OPS"],
  "SVC-OPS": ["DOM-OPS"],
};

export function adaptersForDomain(
  domainId: ProductDomainId,
): RuntimeAdapterBinding[] {
  return RUNTIME_ADAPTER_BINDINGS.filter((row) =>
    (row.ownerDomains as readonly ProductDomainId[]).includes(domainId),
  );
}

export function adaptersForSurface(
  surfaceId: RuntimeSurfaceId,
): RuntimeAdapterBinding[] {
  return RUNTIME_ADAPTER_BINDINGS.filter((row) =>
    (row.surfaces as readonly RuntimeSurfaceId[]).includes(surfaceId),
  );
}

export function adaptersForService(
  serviceId: BackendServiceId,
): RuntimeAdapterBinding[] {
  const surfaces = SERVICE_RUNTIME_SURFACES[serviceId] ?? [];
  const seen = new Set<string>();
  const out: RuntimeAdapterBinding[] = [];
  for (const surfaceId of surfaces) {
    for (const adapter of adaptersForSurface(surfaceId)) {
      if (seen.has(adapter.adapterId)) continue;
      seen.add(adapter.adapterId);
      out.push(adapter);
    }
  }
  return out;
}
