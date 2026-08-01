/**
 * AE-4 — Application integration registry.
 * Seam family catalogue — path/ID refs only; no lib/integration module imports.
 */

export const AE4_SEAM_FAMILY_IDS = [
  "FE_BE",
  "BE_DATA",
  "BE_DOMAIN",
  "FE_DOMAIN",
  "INT_STACK",
  "DELIVERY_STACK",
] as const;

export type Ae4SeamFamilyId = (typeof AE4_SEAM_FAMILY_IDS)[number];

export type Ae4IntegrationRegistryEntry = Readonly<{
  familyId: Ae4SeamFamilyId;
  leftSurface: string;
  rightSurface: string;
  upstreamFreezeRef: string;
  notes: string;
}>;

/**
 * Closed seam family registry — reuses AE-1 surface names as string refs.
 */
export const AE4_INTEGRATION_REGISTRY = [
  {
    familyId: "FE_BE",
    leftSurface: "FRONTEND",
    rightSurface: "BACKEND",
    upstreamFreezeRef: "pi-5-integration-implementation-v1",
    notes: "Frontend ↔ Backend presentation / API seam",
  },
  {
    familyId: "BE_DATA",
    leftSurface: "BACKEND",
    rightSurface: "DATA",
    upstreamFreezeRef: "pi-4-data-implementation-v1",
    notes: "Backend ↔ Data persistence seam",
  },
  {
    familyId: "BE_DOMAIN",
    leftSurface: "BACKEND",
    rightSurface: "DOMAIN",
    upstreamFreezeRef: "pi-3-backend-implementation-v1",
    notes: "Backend ↔ Domain port seam",
  },
  {
    familyId: "FE_DOMAIN",
    leftSurface: "FRONTEND",
    rightSurface: "DOMAIN",
    upstreamFreezeRef: "pi-2-frontend-implementation-v1",
    notes: "Frontend ↔ Domain outcome seam",
  },
  {
    familyId: "INT_STACK",
    leftSurface: "INTEGRATION",
    rightSurface: "CLOSURE",
    upstreamFreezeRef: "pi-5-integration-implementation-v1",
    notes: "Integration stack ↔ closure evidence seam",
  },
  {
    familyId: "DELIVERY_STACK",
    leftSurface: "DELIVERY",
    rightSurface: "IMPLEMENTATION",
    upstreamFreezeRef: "pi-6-delivery-readiness-v1",
    notes: "Delivery readiness ↔ implementation seam",
  },
] as const satisfies readonly Ae4IntegrationRegistryEntry[];

export function getAe4SeamFamily(
  familyId: Ae4SeamFamilyId,
): Ae4IntegrationRegistryEntry | undefined {
  return AE4_INTEGRATION_REGISTRY.find((e) => e.familyId === familyId);
}
