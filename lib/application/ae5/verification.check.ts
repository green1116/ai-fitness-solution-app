/**
 * AE-5 — Declarative verification checks.
 * Check catalogue only — not business assertions / workflow / deployment runners.
 */
import type { Ae5PackageScopeId } from "./verification.registry";

export const AE5_CHECK_IDS = [
  "CHK-AE1-ASSEMBLY",
  "CHK-AE2-RUNTIME",
  "CHK-AE3-WORKFLOW",
  "CHK-AE4-INTEGRATION",
  "CHK-CHAIN",
  "CHK-NO-REDESIGN",
  "CHK-NO-COUPLE",
  "CHK-TSC",
] as const;

export type Ae5CheckId = (typeof AE5_CHECK_IDS)[number];

export type Ae5VerificationCheck = Readonly<{
  checkId: Ae5CheckId;
  packageScope: Ae5PackageScopeId | "CROSS";
  title: string;
  notes: string;
}>;

/**
 * Closed verification check catalogue.
 */
export const AE5_VERIFICATION_CHECKS = [
  {
    checkId: "CHK-AE1-ASSEMBLY",
    packageScope: "AE-1",
    title: "Assembly intact",
    notes: "AE-1 registry / composition gate",
  },
  {
    checkId: "CHK-AE2-RUNTIME",
    packageScope: "AE-2",
    title: "Runtime intact",
    notes: "AE-2 runtime plan gate",
  },
  {
    checkId: "CHK-AE3-WORKFLOW",
    packageScope: "AE-3",
    title: "Workflow intact",
    notes: "AE-3 stage / transition gate",
  },
  {
    checkId: "CHK-AE4-INTEGRATION",
    packageScope: "AE-4",
    title: "Integration intact",
    notes: "AE-4 seam / binding / endpoint gate",
  },
  {
    checkId: "CHK-CHAIN",
    packageScope: "CROSS",
    title: "AE-1→AE-4 chain locked",
    notes: "Upstream package chain citation",
  },
  {
    checkId: "CHK-NO-REDESIGN",
    packageScope: "CROSS",
    title: "No upstream redesign",
    notes: "PD / PIG / PI / AE-1…AE-4 unchanged by AE-5",
  },
  {
    checkId: "CHK-NO-COUPLE",
    packageScope: "CROSS",
    title: "No cross-layer coupling",
    notes: "Path/ID refs only outside AE reuse",
  },
  {
    checkId: "CHK-TSC",
    packageScope: "CROSS",
    title: "TypeScript passes",
    notes: "AE-1…AE-5 tree typecheck",
  },
] as const satisfies readonly Ae5VerificationCheck[];

export function getAe5VerificationCheck(
  checkId: Ae5CheckId,
): Ae5VerificationCheck | undefined {
  return AE5_VERIFICATION_CHECKS.find((c) => c.checkId === checkId);
}
