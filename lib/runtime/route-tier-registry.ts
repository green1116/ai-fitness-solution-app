export type ApiRouteTier = "light" | "heavy";

export interface ApiRouteTierEntry {
  path: string;
  tier: ApiRouteTier;
  description: string;
}

export const COMMERCIAL_PRODUCTS_ROUTE_TIERS: ApiRouteTierEntry[] = [
  {
    path: "/api/commercial-products/catalog",
    tier: "light",
    description: "Product catalog (P1 read-only)",
  },
  {
    path: "/api/commercial-products/quote",
    tier: "light",
    description: "Quote orchestration (access-layer light)",
  },
  {
    path: "/api/commercial-products/pdf/summary",
    tier: "heavy",
    description: "Summary PDF runtime (lazy-loaded)",
  },
  {
    path: "/api/commercial-products/pdf/deliverable",
    tier: "heavy",
    description: "Unified deliverable router (summary/plan/budget/zip)",
  },
  {
    path: "/api/commercial-products/package",
    tier: "heavy",
    description: "Product deliverable package (cover/summary/plan/budget/manifest/zip)",
  },
  {
    path: "/api/commercial-products/delivery",
    tier: "heavy",
    description: "Delivery orchestration engine (policy/decision/plan)",
  },
  {
    path: "/api/commercial-products/workspace",
    tier: "light",
    description: "Customer workspace registry and download center",
  },
  {
    path: "/api/commercial-products/approval",
    tier: "light",
    description: "Approval workflow (draft/review/approved/delivered)",
  },
  {
    path: "/api/commercial-products/audit",
    tier: "light",
    description: "Audit and compliance event tracking",
  },
  {
    path: "/api/commercial-products/release",
    tier: "light",
    description: "Commercial release ledger and manifest",
  },
];

export const HEAVY_PDF_ROUTE_PREFIXES = [
  "/api/commercial-products/pdf/",
  "/api/pdf",
  "/api/pdf/tender/",
  "/api/tender-pack",
  "/api/proposal-pdf/render",
  "/api/plan",
] as const;

export function getRouteTier(path: string): ApiRouteTier {
  const commercial = COMMERCIAL_PRODUCTS_ROUTE_TIERS.find((entry) => entry.path === path);
  if (commercial) return commercial.tier;

  if (HEAVY_PDF_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return "heavy";
  }

  return "light";
}

export function assertRouteTierSeparation(): boolean {
  const light = COMMERCIAL_PRODUCTS_ROUTE_TIERS.filter((entry) => entry.tier === "light");
  const heavy = COMMERCIAL_PRODUCTS_ROUTE_TIERS.filter((entry) => entry.tier === "heavy");
  return light.length >= 1 && heavy.length >= 1;
}
