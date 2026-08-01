/**
 * AE-3 — Application workflow registry.
 * Registry of declarative workflow ids — no executable business flows.
 */

export const AE3_WORKFLOW_FAMILY_IDS = [
  "APPLICATION_ASSEMBLY",
  "APPLICATION_RUNTIME",
  "APPLICATION_WORKFLOW",
] as const;

export type Ae3WorkflowFamilyId = (typeof AE3_WORKFLOW_FAMILY_IDS)[number];

export type Ae3WorkflowRegistryEntry = Readonly<{
  familyId: Ae3WorkflowFamilyId;
  upstreamRef: string;
  notes: string;
}>;

/**
 * Closed workflow family registry — ties to AE-1 / AE-2 / AE-3 identity only.
 */
export const AE3_WORKFLOW_REGISTRY = [
  {
    familyId: "APPLICATION_ASSEMBLY",
    upstreamRef: "application-assembly-ae1-v1",
    notes: "Assembly registry composition (AE-1)",
  },
  {
    familyId: "APPLICATION_RUNTIME",
    upstreamRef: "application-runtime-ae2-v1",
    notes: "Runtime binding catalogue (AE-2)",
  },
  {
    familyId: "APPLICATION_WORKFLOW",
    upstreamRef: "application-workflow-ae3-v1",
    notes: "Workflow stage / transition catalogue (AE-3)",
  },
] as const satisfies readonly Ae3WorkflowRegistryEntry[];

export function getAe3WorkflowFamily(
  familyId: Ae3WorkflowFamilyId,
): Ae3WorkflowRegistryEntry | undefined {
  return AE3_WORKFLOW_REGISTRY.find((e) => e.familyId === familyId);
}
