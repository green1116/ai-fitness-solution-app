/**
 * PI-5.1 — Integration ownership matrix (PD-6.1 §4).
 * Path/ID refs only — no FE/BE/Data module imports.
 */
export type IntegrationOwnerSide =
  | "frontend"
  | "backend"
  | "domain"
  | "data"
  | "existing-api";

export type IntegrationOwnershipRow = Readonly<{
  concernId: string;
  concern: string;
  owner: IntegrationOwnerSide;
  consumer: string;
}>;

export const INTEGRATION_OWNERSHIP = [
  {
    concernId: "OWN-UI",
    concern: "Screens / CMP / INT / routes",
    owner: "frontend",
    consumer: "Users",
  },
  {
    concernId: "OWN-ST",
    concern: "ST-LOCAL / META / presentation cache",
    owner: "frontend",
    consumer: "—",
  },
  {
    concernId: "OWN-API",
    concern: "API wire contracts",
    owner: "existing-api",
    consumer: "FE Adapter + Services",
  },
  {
    concernId: "OWN-SVC",
    concern: "Command/Query orchestration",
    owner: "backend",
    consumer: "API Edge",
  },
  {
    concernId: "OWN-DOM",
    concern: "Business logic / authz outcomes",
    owner: "domain",
    consumer: "Services",
  },
  {
    concernId: "OWN-PERSIST",
    concern: "Durable entities",
    owner: "data",
    consumer: "Domains",
  },
  {
    concernId: "OWN-SESSION",
    concern: "Session mint / enforce",
    owner: "domain",
    consumer: "FE observes",
  },
] as const satisfies readonly IntegrationOwnershipRow[];

/** PD-6.1 O-01…O-05 as locked statements (registry evidence). */
export const INTEGRATION_OWNERSHIP_RULES = [
  "O-01 FE never imports Domain modules",
  "O-02 BE never owns UI catalogues",
  "O-03 Services are not Domains",
  "O-04 Integration adds no M16 / no new API family",
  "O-05 Primary Domain per Command remains PD-2.5",
] as const;
