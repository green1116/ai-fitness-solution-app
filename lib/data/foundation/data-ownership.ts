/**
 * PI-4.1 — Durable data class ownership (PD-5.4 §3).
 * Primary Domain owns create/update/delete semantics.
 */
import type { ProductDomainId } from "../../backend/foundation/domain-ownership";

export const DATA_CLASS_IDS = [
  "DATA-KNOWLEDGE",
  "DATA-ARTIFACT-BYTES",
  "DATA-AGENT-RUN",
  "DATA-OS-PLATFORM",
  "DATA-SESSION",
  "DATA-OPS",
  "DATA-INTELLIGENCE",
  "DATA-EVOLUTION",
  "DATA-UI-CACHE",
] as const;

export type DataClassId = (typeof DATA_CLASS_IDS)[number];

export type DataOwnershipRow = Readonly<{
  dataClassId: DataClassId;
  content: string;
  primaryDomain: ProductDomainId | "FRONTEND";
  supportingDomains: readonly ProductDomainId[];
  durableSoT: boolean;
}>;

/**
 * PD-5.4 §3.1 durable data classes.
 * DATA-UI-CACHE is frontend disposable — not Domain persistence SoT.
 */
export const DATA_OWNERSHIP = [
  {
    dataClassId: "DATA-KNOWLEDGE",
    content:
      "Tender intake, requirements knowledge, document catalog entries, artifact metadata",
    primaryDomain: "M11",
    supportingDomains: ["M13", "M12"],
    durableSoT: true,
  },
  {
    dataClassId: "DATA-ARTIFACT-BYTES",
    content: "Plan/budget/proposal/tender file bytes",
    primaryDomain: "M11",
    supportingDomains: ["M14", "M15"],
    durableSoT: true,
  },
  {
    dataClassId: "DATA-AGENT-RUN",
    content: "Agent/autopilot job runs, orchestration progress",
    primaryDomain: "M12",
    supportingDomains: ["M11", "M14"],
    durableSoT: true,
  },
  {
    dataClassId: "DATA-OS-PLATFORM",
    content:
      "Tenants, users, projects, workspace cues, entitlements presentation sources",
    primaryDomain: "M13",
    supportingDomains: ["M15"],
    durableSoT: true,
  },
  {
    dataClassId: "DATA-SESSION",
    content: "Auth session records",
    primaryDomain: "M13",
    supportingDomains: [],
    durableSoT: true,
  },
  {
    dataClassId: "DATA-OPS",
    content: "Admin metrics snapshots sources, org/user ops configs",
    primaryDomain: "M13",
    supportingDomains: ["M15"],
    durableSoT: true,
  },
  {
    dataClassId: "DATA-INTELLIGENCE",
    content:
      "Solution/budget/proposal analysis outcomes, opportunity records",
    primaryDomain: "M14",
    supportingDomains: ["M11", "M12"],
    durableSoT: true,
  },
  {
    dataClassId: "DATA-EVOLUTION",
    content: "Share/feedback signals, governance oversight records",
    primaryDomain: "M15",
    supportingDomains: ["M11", "M13"],
    durableSoT: true,
  },
  {
    dataClassId: "DATA-UI-CACHE",
    content: "ST-SERVER display snapshots",
    primaryDomain: "FRONTEND",
    supportingDomains: [],
    durableSoT: false,
  },
] as const satisfies readonly DataOwnershipRow[];

/** Durable Domain-owned classes only (excludes FE cache). */
export function durableDataClasses(): DataOwnershipRow[] {
  return DATA_OWNERSHIP.filter((row) => row.durableSoT);
}

export function getDataOwnership(
  dataClassId: DataClassId,
): DataOwnershipRow | undefined {
  return DATA_OWNERSHIP.find((row) => row.dataClassId === dataClassId);
}

export function dataClassesForDomain(
  domainId: ProductDomainId,
): DataOwnershipRow[] {
  return DATA_OWNERSHIP.filter(
    (row) =>
      row.primaryDomain === domainId ||
      (row.supportingDomains as readonly ProductDomainId[]).includes(domainId),
  );
}
