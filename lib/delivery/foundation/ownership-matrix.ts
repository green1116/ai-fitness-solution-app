/**
 * PI-6.1 — Delivery readiness ownership matrix (PD-7).
 * Path/ID refs only — no FE/BE/Data/Integration module imports.
 */
export type DeliveryOwnerSide =
  | "release"
  | "operations"
  | "security"
  | "product"
  | "customer"
  | "existing-layer";

export type DeliveryOwnershipRow = Readonly<{
  concernId: string;
  concern: string;
  owner: DeliveryOwnerSide;
  consumer: string;
}>;

export const DELIVERY_OWNERSHIP = [
  {
    concernId: "OWN-REL",
    concern: "Release Go / No-Go (PD-7.1)",
    owner: "release",
    consumer: "Deployment / Sign-off",
  },
  {
    concernId: "OWN-DEP",
    concern: "ENV-* promote / ART-META (PD-7.2)",
    owner: "operations",
    consumer: "Runtime environments",
  },
  {
    concernId: "OWN-OPS",
    concern: "Health / jobs / integrity (PD-7.3)",
    owner: "operations",
    consumer: "ENV-STAGING / ENV-PROD",
  },
  {
    concernId: "OWN-SEC",
    concern: "Security veto / secrets (PD-7.1 / 7.7)",
    owner: "security",
    consumer: "Release + Deployment",
  },
  {
    concernId: "OWN-CUST",
    concern: "Customer enablement (PD-7.4)",
    owner: "customer",
    consumer: "Pilot / Sign-off",
  },
  {
    concernId: "OWN-DOC",
    concern: "Documentation readiness (PD-7.5)",
    owner: "product",
    consumer: "Customer / Pilot",
  },
  {
    concernId: "OWN-LAYER",
    concern: "FE / BE / Data / Integration / Domains",
    owner: "existing-layer",
    consumer: "All readiness concerns",
  },
] as const satisfies readonly DeliveryOwnershipRow[];

/** Locked delivery ownership rules (registry evidence). */
export const DELIVERY_OWNERSHIP_RULES = [
  "D-01 Delivery invents no Domains / API families / Screens",
  "D-02 FE / BE / Data / Integration remain unmodified owners of their layers",
  "D-03 ENV-PROD requires RELEASE_READY ∧ deploy readiness",
  "D-04 Security veto blocks Go regardless of UI green",
  "D-05 Primary Domains remain M11–M15 only",
] as const;
