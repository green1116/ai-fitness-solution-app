/**
 * AE-6 — Application freeze baseline catalogue.
 * Baseline IDs only — not a new architecture or deployment baseline engine.
 */

export const AE6_APPLICATION_BASELINE_ID =
  "application-assembly-baseline-v1" as const;

export const AE6_APPLICATION_COMPLETE_ID =
  "application-assembly-complete-v1" as const;

export const AE6_TAG_REF = "ae-6-application-freeze-v1" as const;

export type Ae6BaselineEntry = Readonly<{
  baselineId: string;
  role: string;
  notes: string;
}>;

/**
 * Closed baseline catalogue for application freeze.
 */
export const AE6_BASELINE_CATALOGUE = [
  {
    baselineId: AE6_APPLICATION_BASELINE_ID,
    role: "application-baseline",
    notes: "Assembly stack baseline over AE-1…AE-5",
  },
  {
    baselineId: AE6_APPLICATION_COMPLETE_ID,
    role: "application-complete",
    notes: "Application assembly complete citation",
  },
  {
    baselineId: "application-assembly-ae1-v1",
    role: "ae1",
    notes: "Assembly layer freeze ref",
  },
  {
    baselineId: "application-runtime-ae2-v1",
    role: "ae2",
    notes: "Runtime layer freeze ref",
  },
  {
    baselineId: "application-workflow-ae3-v1",
    role: "ae3",
    notes: "Workflow layer freeze ref",
  },
  {
    baselineId: "application-integration-ae4-v1",
    role: "ae4",
    notes: "Integration layer freeze ref",
  },
  {
    baselineId: "application-verification-ae5-v1",
    role: "ae5",
    notes: "Verification layer freeze ref",
  },
] as const satisfies readonly Ae6BaselineEntry[];
