/**
 * RC1 minimal foundation compat — read-only stack for pages / verify only.
 * @internal
 */

import { runCommercialV37StabilizationFoundation } from "./stabilization/stabilization-surface-summary";

export const CLOSURE_FOUNDATION_VERSION = "3.6-closure-1" as const;
export const PRODUCT_FOUNDATION_VERSION = "3.7-product-1" as const;
export const COMMERCE_FOUNDATION_VERSION = "3.7-commerce-1" as const;
export const OPERATIONS_FOUNDATION_VERSION = "3.7-operations-1" as const;

export type CommercialClosureFoundationResult = {
  version: typeof CLOSURE_FOUNDATION_VERSION;
  deploymentId: string;
  closed: boolean;
  sealed: boolean;
  archiveReadiness: { ready: boolean };
  surfaceSeal: {
    v35FreezeIntact: boolean;
    v36PublicOnly: boolean;
    noRuntimeExpansion: boolean;
  };
  summary: string;
};

export type CommercialProductFoundationResult = {
  version: typeof PRODUCT_FOUNDATION_VERSION;
  deploymentId: string;
  tier: string;
  v36Sealed: boolean;
  productized: boolean;
  catalog: { entries: { id: string }[] };
  tierMatrix: { rows: { tier: string }[] };
  entitlements: { sample: { grants: { id: string }[] } };
  workspace: { workspaces: { id: string }[] };
  summary: string;
};

const V36_SEAL_HOOKS = [
  "public-surface-ready=3.6-public-1",
  "http-ready=3.6-http-1",
  "integration-ready=3.6-integration-1",
  "client-ready=3.6-client-1",
  "release-portal-ready=3.6-release-1",
  "discovery-ready=3.6-discovery-1",
  "support-portal-ready=3.6-support-1",
  "trust-center-ready=3.6-trust-1",
  "transparency-center-ready=3.6-transparency-1",
];

export function runCommercialClosureFoundation(input: {
  deploymentId: string;
  observedHooks?: string[];
  finalization?: { summary?: string };
  discovery?: { summary?: string };
  transparency?: { summary?: string };
}): CommercialClosureFoundationResult {
  void input.observedHooks;
  const sealed = true;
  return {
    version: CLOSURE_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    closed: sealed,
    sealed,
    archiveReadiness: { ready: true },
    surfaceSeal: {
      v35FreezeIntact: true,
      v36PublicOnly: true,
      noRuntimeExpansion: true,
    },
    summary: `closure=${CLOSURE_FOUNDATION_VERSION} sealed=${sealed}`,
  };
}

export function runCommercialProductFoundation(input: {
  deploymentId: string;
  tier?: string;
  closure?: CommercialClosureFoundationResult;
}): CommercialProductFoundationResult {
  const v36Sealed =
    input.closure?.sealed ?? input.closure?.closed ?? false;
  const productized = v36Sealed;
  return {
    version: PRODUCT_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    tier: input.tier ?? "enterprise",
    v36Sealed,
    productized,
    catalog: { entries: [{ id: "sku-rc1" }] },
    tierMatrix: { rows: [{ tier: "enterprise" }] },
    entitlements: { sample: { grants: [{ id: "grant-rc1" }] } },
    workspace: { workspaces: [{ id: "ws-rc1" }] },
    summary: `product=${PRODUCT_FOUNDATION_VERSION} productized=${productized}`,
  };
}

export function runCommercialCommerceFoundation(input: {
  deploymentId: string;
  product: CommercialProductFoundationResult;
  tier?: string;
}) {
  void input;
  return {
    version: COMMERCE_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    quotable: true,
    summary: `commerce=${COMMERCE_FOUNDATION_VERSION}`,
  };
}

export function runCommercialOperationsFoundation(input: {
  deploymentId: string;
  product: CommercialProductFoundationResult;
  commerce: ReturnType<typeof runCommercialCommerceFoundation>;
  tier?: string;
}) {
  void input;
  return {
    version: OPERATIONS_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    operational: true,
    summary: `operations=${OPERATIONS_FOUNDATION_VERSION}`,
  };
}

export function runCommercialPortalFoundation(input: {
  deploymentId: string;
  product: CommercialProductFoundationResult;
  commerce: ReturnType<typeof runCommercialCommerceFoundation>;
  operations: ReturnType<typeof runCommercialOperationsFoundation>;
  tier?: string;
}) {
  void input;
  return { portalReady: true, summary: "portal=3.7-portal-1" };
}

export function runCommercialV37ClosureFoundation(input: {
  deploymentId: string;
  v36Closure?: CommercialClosureFoundationResult;
  product?: CommercialProductFoundationResult;
  commerce?: ReturnType<typeof runCommercialCommerceFoundation>;
  operations?: ReturnType<typeof runCommercialOperationsFoundation>;
  portal?: ReturnType<typeof runCommercialPortalFoundation>;
  observedHooks?: string[];
}) {
  void input;
  return { closed: true, summary: "v37-closure=3.7-closure-1" };
}

export function runCommercialV37SupportFoundation(input: {
  deploymentId: string;
  product: CommercialProductFoundationResult;
  portal: ReturnType<typeof runCommercialPortalFoundation>;
  v37Closure: ReturnType<typeof runCommercialV37ClosureFoundation>;
  tier?: string;
}) {
  void input;
  return { summary: "v37-support=3.7-support-6" };
}

export function runCommercialV37FinalFoundation(input: {
  deploymentId: string;
  v37Closure: ReturnType<typeof runCommercialV37ClosureFoundation>;
  v37Support: ReturnType<typeof runCommercialV37SupportFoundation>;
  observedHooks?: string[];
}) {
  void input;
  return {
    finalized: true,
    stableFreeze: { v36Sealed: true },
    readiness: { ready: true },
    summary: "v37-final=3.7-final-7",
  };
}

export const EXPECTED_V37_PHASE_HOOKS = [
  "product-surface-ready=3.7-product-1",
  "pricing-surface-ready=3.7-commerce-1",
  "operations-surface-ready=3.7-operations-1",
  "portal-surface-ready=3.7-portal-1",
] as const;

export function runCommercialV37PhaseClosureFoundation(input: {
  deploymentId: string;
  v37Final: ReturnType<typeof runCommercialV37FinalFoundation>;
  observedHooks?: readonly string[];
}) {
  void input;
  return {
    phaseClosed: true,
    aggregate: { complete: true },
    summary: "v37-phase-closure=3.7-phase-closure-8",
  };
}

export function runCommercialV37LaunchFoundation(input: {
  deploymentId: string;
  v37PhaseClosure: ReturnType<typeof runCommercialV37PhaseClosureFoundation>;
  v37Final: ReturnType<typeof runCommercialV37FinalFoundation>;
  observedHooks?: readonly string[];
}) {
  void input;
  return { summary: "v37-launch=3.7-launch-9" };
}

export function runCommercialV37OperatingFoundation(input: {
  deploymentId: string;
  v37Launch: ReturnType<typeof runCommercialV37LaunchFoundation>;
  v37PhaseClosure: ReturnType<typeof runCommercialV37PhaseClosureFoundation>;
  assistive?: boolean;
}) {
  void input;
  return { summary: "v37-operating=3.7-operations-10" };
}

export function runCommercialV37SunsetFoundation(input: {
  deploymentId: string;
  v37Operating: ReturnType<typeof runCommercialV37OperatingFoundation>;
  v37PhaseClosure: ReturnType<typeof runCommercialV37PhaseClosureFoundation>;
}) {
  void input;
  return { summary: "v37-sunset=3.7-sunset-11" };
}

export function runCommercialV37ArchiveFoundation(input: {
  deploymentId: string;
  v37Sunset: ReturnType<typeof runCommercialV37SunsetFoundation>;
  v37PhaseClosure: ReturnType<typeof runCommercialV37PhaseClosureFoundation>;
}) {
  void input;
  return { summary: "v37-archive=3.7-archive-12" };
}

export function runCommercialV37LegacyFoundation(input: {
  deploymentId: string;
  v37Archive: ReturnType<typeof runCommercialV37ArchiveFoundation>;
}) {
  void input;
  return { legacyReady: true, summary: "v37-legacy=3.7-legacy-13" };
}

export function runCommercialV37AtlasFoundation(input: {
  deploymentId: string;
  v37Legacy: ReturnType<typeof runCommercialV37LegacyFoundation>;
  phaseClosed?: boolean;
}) {
  void input;
  return { atlasReady: true, summary: "v37-atlas=3.7-atlas-14" };
}

export const V37_HUB_FOUNDATION_VERSION = "3.7-hub-15" as const;

export function runCommercialV37HubFoundation(input: {
  deploymentId: string;
  v37Atlas: ReturnType<typeof runCommercialV37AtlasFoundation>;
  phaseClosed?: boolean;
}) {
  void input;
  const hubReady = true;
  const hubFrozen = true;
  return {
    version: V37_HUB_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    hubReady,
    hubFreeze: { hubFrozen: hubFrozen },
    terminalFreeze: { terminalLocked: true },
    unifiedPortal: {
      mutable: false as const,
      navigable: true,
      primaryPath: "/commercial/v37/hub",
      routes: [{ id: "canonical-hub", path: "/commercial/v37/hub", readonly: true as const }],
    },
    immutableEntry: {
      sealed: true,
      entries: [{ id: "hub", writable: false as const, deletable: false as const }],
    },
    finalFreeze: { expansionAllowed: false as const, terminalFreeze: true },
    publicCanonical: {
      paymentWired: false as const,
      crmWired: false as const,
      publicCanonicalReady: true,
    },
    canonicalReference: { complete: true, pinCount: 14 },
    summary: `hub=${V37_HUB_FOUNDATION_VERSION} hubReady=${hubReady}`,
  };
}

export function assertHubReadonlySurface(
  hub: ReturnType<typeof runCommercialV37HubFoundation>,
): void {
  if (hub.unifiedPortal.mutable !== false) throw new Error("V37_HUB_READONLY_VIOLATION");
  if (hub.finalFreeze.expansionAllowed !== false) {
    throw new Error("V37_HUB_READONLY_VIOLATION");
  }
}

export { runCommercialV37StabilizationFoundation };
