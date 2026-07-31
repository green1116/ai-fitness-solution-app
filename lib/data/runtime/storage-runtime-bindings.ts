/**
 * PI-4.3 — Storage family → existing runtime engine bindings (PD-5.4 §2).
 * Reuses existing engines only — no new storage families.
 */
import type { ProductDomainId } from "../../backend/foundation/domain-ownership";
import type { StorageFamilyId } from "../foundation/storage-families";

export type PersistenceRuntimeAdapter = Readonly<{
  adapterId: string;
  /** Existing module path; null only for non-SoT ephemeral cache. */
  modulePath: string | null;
  /** Optional schema declaration path (existing). */
  schemaPath: string | null;
  storageFamilies: readonly StorageFamilyId[];
  ownerDomains: readonly ProductDomainId[];
  isSourceOfTruth: boolean;
  notes: string;
}>;

/**
 * Closed set of existing persistence runtime adapters.
 */
export const STORAGE_RUNTIME_BINDINGS = [
  {
    adapterId: "PRT-PRISMA",
    modulePath: "lib/prisma.ts",
    schemaPath: "prisma/schema.prisma",
    storageFamilies: [
      "STF-RELATIONAL",
      "STF-DOCUMENT",
      "STF-JOB",
      "STF-SESSION",
      "STF-AUDIT",
    ],
    ownerDomains: ["M11", "M12", "M13", "M14", "M15"],
    isSourceOfTruth: true,
    notes: "Existing Prisma client + schema",
  },
  {
    adapterId: "PRT-OBJECT-FS",
    modulePath: "lib/storage/plan-storage.ts",
    schemaPath: null,
    storageFamilies: ["STF-OBJECT"],
    ownerDomains: ["M11"],
    isSourceOfTruth: true,
    notes: "Existing plan/artifact filesystem store",
  },
  {
    adapterId: "PRT-V80-JOB",
    modulePath: "lib/scaffold/v80/runtime/prisma.backend.ts",
    schemaPath: "prisma/schema.prisma",
    storageFamilies: ["STF-JOB", "STF-RELATIONAL"],
    ownerDomains: ["M12", "M11", "M13", "M14"],
    isSourceOfTruth: true,
    notes: "Existing v80 scaffold job/runtime backend",
  },
  {
    adapterId: "PRT-SESSION",
    modulePath: "lib/session.ts",
    schemaPath: "prisma/schema.prisma",
    storageFamilies: ["STF-SESSION"],
    ownerDomains: ["M13"],
    isSourceOfTruth: true,
    notes: "Existing session store",
  },
  {
    adapterId: "PRT-AUDIT-GOV",
    modulePath: "lib/operations/governance",
    schemaPath: null,
    storageFamilies: ["STF-AUDIT"],
    ownerDomains: ["M13", "M15"],
    isSourceOfTruth: true,
    notes: "Existing governance / audit persistence surfaces",
  },
  {
    adapterId: "PRT-CACHE-BE",
    modulePath: null,
    schemaPath: null,
    storageFamilies: ["STF-CACHE-BE"],
    ownerDomains: ["M11", "M12", "M13", "M14", "M15"],
    isSourceOfTruth: false,
    notes: "Ephemeral backend cache — non-SoT; no durable engine",
  },
] as const satisfies readonly PersistenceRuntimeAdapter[];

export function storageAdaptersForFamily(
  familyId: StorageFamilyId,
): PersistenceRuntimeAdapter[] {
  return STORAGE_RUNTIME_BINDINGS.filter((row) =>
    (row.storageFamilies as readonly StorageFamilyId[]).includes(familyId),
  );
}

export function getStorageRuntimeAdapter(
  adapterId: string,
): PersistenceRuntimeAdapter | undefined {
  return STORAGE_RUNTIME_BINDINGS.find((row) => row.adapterId === adapterId);
}
