import { buildCommercialClosureModel } from "./commercial-closure-model";

export const SURFACE_REGISTRY_VERSION = "3.7-surface-registry-1" as const;

export type SurfaceRegistryEntry = {
  id: string;
  step: number;
  label: string;
  path: string;
  docPath?: string;
  hook: string;
};

export type SurfaceRegistry = {
  version: typeof SURFACE_REGISTRY_VERSION;
  entries: SurfaceRegistryEntry[];
  entryCount: number;
  sealed: boolean;
  summary: string;
};

const V37_SURFACES: Omit<SurfaceRegistryEntry, "step">[] = [
  /** Step 1 product surface — not the Step 15/16 canonical entry (`canonical-hub`). */
  { id: "hub", label: "V3.7 product surface", path: "/commercial/v37", hook: "product-surface-ready" },
  { id: "products", label: "Product catalog", path: "/commercial/v37/products", docPath: "/docs/commercialization", hook: "product-catalog-ready" },
  { id: "workspace", label: "Workspaces", path: "/commercial/v37/workspace", hook: "workspace-ready" },
  { id: "pricing", label: "Pricing", path: "/commercial/v37/pricing", docPath: "/docs/commercialization", hook: "pricing-table-ready" },
  { id: "quote", label: "Quote", path: "/commercial/v37/quote", hook: "quote-builder-ready" },
  { id: "terms", label: "Terms", path: "/commercial/v37/terms", hook: "commercial-terms-ready" },
  { id: "orders", label: "Orders", path: "/commercial/v37/orders", docPath: "/docs/commercialization/orders.md", hook: "order-model-ready" },
  { id: "subscription", label: "Subscription", path: "/commercial/v37/subscription", docPath: "/docs/commercialization/subscription.md", hook: "subscription-model-ready" },
  { id: "onboarding", label: "Onboarding", path: "/commercial/v37/onboarding", docPath: "/docs/commercialization/onboarding.md", hook: "onboarding-ready" },
  { id: "portal", label: "Customer portal", path: "/commercial/v37/portal", docPath: "/docs/commercialization/portal.md", hook: "customer-portal-ready" },
  { id: "billing", label: "Billing", path: "/commercial/v37/billing", docPath: "/docs/commercialization/billing.md", hook: "billing-surface-ready" },
  { id: "invoices", label: "Invoices", path: "/commercial/v37/invoices", docPath: "/docs/commercialization/invoices.md", hook: "invoice-surface-ready" },
  { id: "account", label: "Account", path: "/commercial/v37/account", docPath: "/docs/commercialization/account.md", hook: "account-surface-ready" },
  { id: "closure", label: "V3.7 closure", path: "/commercial/v37/closure", docPath: "/docs/commercialization/closure.md", hook: "v37-closure-ready" },
  { id: "support", label: "Support", path: "/commercial/v37/support", docPath: "/docs/commercialization/support.md", hook: "support-surface-ready" },
  { id: "final", label: "Final closure", path: "/commercial/v37/final", docPath: "/docs/commercialization/final-closure.md", hook: "final-surface-ready" },
  {
    id: "phase-closure",
    label: "Phase locked",
    path: "/commercial/v37/phase-closure",
    docPath: "/docs/commercialization/v37-phase-closure.md",
    hook: "v37-phase-closure-ready",
  },
  {
    id: "launch",
    label: "Launch candidate",
    path: "/commercial/v37/launch",
    docPath: "/docs/commercialization/launch-candidate.md",
    hook: "launch-surface-ready",
  },
  {
    id: "post-launch-ops",
    label: "Post-launch operations",
    path: "/commercial/v37/operations",
    docPath: "/docs/commercialization/operating-state.md",
    hook: "operating-surface-ready",
  },
  {
    id: "sunset",
    label: "Sunset / lifecycle exit",
    path: "/commercial/v37/sunset",
    docPath: "/docs/commercialization/sunset.md",
    hook: "sunset-surface-ready",
  },
  {
    id: "historical-archive",
    label: "Historical archive",
    path: "/commercial/v37/archive",
    docPath: "/docs/commercialization/readonly-archive.md",
    hook: "archive-surface-ready",
  },
  {
    id: "legacy-terminal",
    label: "Legacy / terminal",
    path: "/commercial/v37/legacy",
    docPath: "/docs/commercialization/legacy-support.md",
    hook: "terminal-surface-ready",
  },
  {
    id: "atlas",
    label: "Master atlas",
    path: "/commercial/v37/atlas",
    docPath: "/docs/commercialization/master-atlas.md",
    hook: "master-surface-ready",
  },
  {
    id: "canonical-hub",
    label: "Canonical reference hub",
    path: "/commercial/v37/hub",
    docPath: "/docs/commercialization/canonical-reference.md",
    hook: "hub-surface-ready",
  },
  {
    id: "stabilization",
    label: "Final stabilization",
    path: "/commercial/v37/stabilization",
    docPath: "/docs/commercialization/final-stabilization.md",
    hook: "stabilization-surface-ready",
  },
  { id: "v36-closure", label: "V3.6 closure (prerequisite)", path: "/commercial/v36/closure", hook: "v36-phase-closed" },
];

export function buildSurfaceRegistry(input?: {
  stepsComplete?: boolean;
}): SurfaceRegistry {
  const model = buildCommercialClosureModel();
  const entries: SurfaceRegistryEntry[] = V37_SURFACES.map((s, i) => ({
    ...s,
    step: i < 4 ? 1 : i < 7 ? 2 : i < 10 ? 3 : i < 14 ? 4 : 5,
  }));

  const sealed = input?.stepsComplete ?? false;

  return {
    version: SURFACE_REGISTRY_VERSION,
    entries,
    entryCount: entries.length,
    sealed,
    summary: `surface-registry entries=${entries.length} sealed=${sealed} phase=${model.phaseId}`,
  };
}
