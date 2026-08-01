/**
 * AE-5 — Application verification registry.
 * Registers AE-1…AE-4 evidence surfaces — no redesign / no layer imports.
 */

export const AE5_PACKAGE_SCOPE_IDS = [
  "AE-1",
  "AE-2",
  "AE-3",
  "AE-4",
] as const;

export type Ae5PackageScopeId = (typeof AE5_PACKAGE_SCOPE_IDS)[number];

export type Ae5VerificationRegistryEntry = Readonly<{
  packageId: Ae5PackageScopeId;
  layerId: string;
  evidenceScript: string;
  modulePath: string;
  notes: string;
}>;

/**
 * Closed verification registry — one evidence row per upstream AE package.
 */
export const AE5_VERIFICATION_REGISTRY = [
  {
    packageId: "AE-1",
    layerId: "application-assembly-ae1-v1",
    evidenceScript: "scripts/verify-application-ae1.ts",
    modulePath: "lib/application/ae1",
    notes: "Assembly verification evidence",
  },
  {
    packageId: "AE-2",
    layerId: "application-runtime-ae2-v1",
    evidenceScript: "scripts/verify-application-ae2.ts",
    modulePath: "lib/application/ae2",
    notes: "Runtime verification evidence",
  },
  {
    packageId: "AE-3",
    layerId: "application-workflow-ae3-v1",
    evidenceScript: "scripts/verify-application-ae3.ts",
    modulePath: "lib/application/ae3",
    notes: "Workflow verification evidence",
  },
  {
    packageId: "AE-4",
    layerId: "application-integration-ae4-v1",
    evidenceScript: "scripts/verify-application-ae4.ts",
    modulePath: "lib/application/ae4",
    notes: "Integration verification evidence",
  },
] as const satisfies readonly Ae5VerificationRegistryEntry[];

export function getAe5VerificationEntry(
  packageId: Ae5PackageScopeId,
): Ae5VerificationRegistryEntry | undefined {
  return AE5_VERIFICATION_REGISTRY.find((e) => e.packageId === packageId);
}
