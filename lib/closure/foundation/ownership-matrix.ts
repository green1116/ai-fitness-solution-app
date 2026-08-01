/**
 * PI-8.1 — Product Closure ownership matrix.
 * Path/ID refs only — no FE/BE/Data/Integration/Delivery/Implementation imports.
 */
export type ClosureOwnerSide =
  | "frontend"
  | "backend"
  | "data"
  | "integration"
  | "delivery"
  | "implementation"
  | "domain"
  | "closure";

export type ClosureOwnershipRow = Readonly<{
  concernId: string;
  concern: string;
  owner: ClosureOwnerSide;
  consumer: string;
}>;

export const CLOSURE_OWNERSHIP = [
  {
    concernId: "OWN-FE",
    concern: "Screens / CMP / INT / routes (PI-2)",
    owner: "frontend",
    consumer: "Users / Delivery",
  },
  {
    concernId: "OWN-BE",
    concern: "API / Services / Domain ports (PI-3)",
    owner: "backend",
    consumer: "Frontend Adapter / Integration",
  },
  {
    concernId: "OWN-DATA",
    concern: "Persistence ports / repositories (PI-4)",
    owner: "data",
    consumer: "Domains",
  },
  {
    concernId: "OWN-INT",
    concern: "Integration pipeline / seams (PI-5)",
    owner: "integration",
    consumer: "Delivery / Implementation",
  },
  {
    concernId: "OWN-DEL",
    concern: "Readiness / ENV-* / sign-off (PI-6)",
    owner: "delivery",
    consumer: "Release / Ops",
  },
  {
    concernId: "OWN-IMP",
    concern: "Package registry PI-2…PI-6 (PI-7)",
    owner: "implementation",
    consumer: "Closure evidence",
  },
  {
    concernId: "OWN-DOM",
    concern: "M11–M15 business outcomes",
    owner: "domain",
    consumer: "Services",
  },
  {
    concernId: "OWN-CLOSE",
    concern: "Product closure registry (PI-8)",
    owner: "closure",
    consumer: "Final freeze / evidence",
  },
] as const satisfies readonly ClosureOwnershipRow[];

/** Locked closure ownership rules (registry evidence). */
export const CLOSURE_OWNERSHIP_RULES = [
  "C-01 Closure invents no Domains / API families / Screens",
  "C-02 FE / BE / Data / Integration / Delivery / Implementation remain layer owners",
  "C-03 PI-8 registers PI-2…PI-7 freezes only — no parallel stack",
  "C-04 Primary Domains remain M11–M15 only",
  "C-05 PD-7 readiness + PI-7 implementation remain sources of truth",
] as const;
