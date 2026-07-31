/**
 * PI-4.1 — Closed storage family catalogue (PD-5.4 §2.3).
 * Infrastructure classes only — not product Domains.
 */
import type { ProductDomainId } from "../../backend/foundation/domain-ownership";

export const STORAGE_FAMILY_IDS = [
  "STF-RELATIONAL",
  "STF-DOCUMENT",
  "STF-OBJECT",
  "STF-JOB",
  "STF-SESSION",
  "STF-AUDIT",
  "STF-CACHE-BE",
] as const;

export type StorageFamilyId = (typeof STORAGE_FAMILY_IDS)[number];

export type StorageFamilyRecord = Readonly<{
  familyId: StorageFamilyId;
  kind: string;
  typicalUse: string;
  owningDomains: readonly ProductDomainId[];
  isSourceOfTruth: boolean;
}>;

export const STORAGE_FAMILY_CATALOGUE = [
  {
    familyId: "STF-RELATIONAL",
    kind: "Relational / structured records",
    typicalUse: "Projects, users, opportunities, catalogs, ops rows",
    owningDomains: ["M13", "M11", "M14", "M15"],
    isSourceOfTruth: true,
  },
  {
    familyId: "STF-DOCUMENT",
    kind: "Document / JSON document stores",
    typicalUse: "Flexible Domain records (existing use only)",
    owningDomains: ["M11", "M14"],
    isSourceOfTruth: true,
  },
  {
    familyId: "STF-OBJECT",
    kind: "Object / blob artifact bytes",
    typicalUse: "PDFs, uploads, export binaries",
    owningDomains: ["M11"],
    isSourceOfTruth: true,
  },
  {
    familyId: "STF-JOB",
    kind: "Job / run state stores",
    typicalUse: "Autopilot / agent orchestration state",
    owningDomains: ["M12"],
    isSourceOfTruth: true,
  },
  {
    familyId: "STF-SESSION",
    kind: "Session / credential stores",
    typicalUse: "Auth sessions",
    owningDomains: ["M13"],
    isSourceOfTruth: true,
  },
  {
    familyId: "STF-AUDIT",
    kind: "Audit / governance logs",
    typicalUse: "Ops audit, evolution governance",
    owningDomains: ["M13", "M15"],
    isSourceOfTruth: true,
  },
  {
    familyId: "STF-CACHE-BE",
    kind: "Backend ephemeral cache",
    typicalUse: "Read acceleration only",
    owningDomains: ["M11", "M12", "M13", "M14", "M15"],
    isSourceOfTruth: false,
  },
] as const satisfies readonly StorageFamilyRecord[];

export function getStorageFamily(
  familyId: StorageFamilyId,
): StorageFamilyRecord | undefined {
  return STORAGE_FAMILY_CATALOGUE.find((row) => row.familyId === familyId);
}
