/**
 * PI-7.1 — Product Implementation ownership matrix.
 * Path/ID refs only — no FE/BE/Data/Integration/Delivery module imports.
 */
export type ImplementationOwnerSide =
  | "frontend"
  | "backend"
  | "data"
  | "integration"
  | "delivery"
  | "domain"
  | "closure";

export type ImplementationOwnershipRow = Readonly<{
  concernId: string;
  concern: string;
  owner: ImplementationOwnerSide;
  consumer: string;
}>;

export const IMPLEMENTATION_OWNERSHIP = [
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
    consumer: "Delivery readiness",
  },
  {
    concernId: "OWN-DEL",
    concern: "Readiness / ENV-* / sign-off (PI-6)",
    owner: "delivery",
    consumer: "Release / Ops",
  },
  {
    concernId: "OWN-DOM",
    concern: "M11–M15 business outcomes",
    owner: "domain",
    consumer: "Services",
  },
  {
    concernId: "OWN-CLOSE",
    concern: "Implementation package registry (PI-7)",
    owner: "closure",
    consumer: "Freeze / evidence",
  },
] as const satisfies readonly ImplementationOwnershipRow[];

/** Locked implementation ownership rules (registry evidence). */
export const IMPLEMENTATION_OWNERSHIP_RULES = [
  "I-01 Implementation invents no Domains / API families / Screens",
  "I-02 FE / BE / Data / Integration / Delivery remain layer owners",
  "I-03 PI-7 registers PI-2…PI-6 freezes only — no parallel stack",
  "I-04 Primary Domains remain M11–M15 only",
  "I-05 PD-7 readiness baseline remains the delivery source of truth",
] as const;
