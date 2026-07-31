/**
 * PI-5.4 — Binding kind → integration exposure modes (PD-6.1 / PD-6.2).
 * Reuses PI-5.2 kinds and PI-5.3 workflows — no new families.
 */
import type { IntegrationBindingKind } from "../foundation/binding-kinds";
import type { IntegrationPointId } from "../foundation/integration-points";
import type { IntegrationWorkflowId } from "../routing/workflow-kinds";

/**
 * How integration outcomes are exposed at the FE↔BE seam.
 */
export type IntegrationExposureMode =
  | "intent-up"
  | "dto-down"
  | "domain-outcome"
  | "persist-sot"
  | "client-nav"
  | "error-envelope"
  | "job-status";

export type BindingKindExposure = Readonly<{
  bindingKind: IntegrationBindingKind;
  modes: readonly IntegrationExposureMode[];
  /** Primary exposure seam (existing INTP). */
  primaryPointId: IntegrationPointId;
  /** Contracts surfaced for this kind. */
  contractIds: readonly string[];
  workflowBias: readonly IntegrationWorkflowId[];
  notes: string;
}>;

export const BINDING_KIND_EXPOSURE = [
  {
    bindingKind: "API",
    modes: ["intent-up", "dto-down", "domain-outcome", "persist-sot"],
    primaryPointId: "INTP-API-SURFACE",
    contractIds: ["C0", "C1", "C2", "C3", "C4", "C5"],
    workflowBias: ["WF-READ", "WF-COMMAND"],
    notes: "Full HTTP Domain chain exposure",
  },
  {
    bindingKind: "API+NAV",
    modes: [
      "intent-up",
      "dto-down",
      "domain-outcome",
      "persist-sot",
      "client-nav",
    ],
    primaryPointId: "INTP-API-SURFACE",
    contractIds: ["C0", "C1", "C2", "C3", "C4", "C5", "C7"],
    workflowBias: ["WF-COMMAND", "WF-READ", "WF-NAV"],
    notes: "Domain success then FE-owned NAV",
  },
  {
    bindingKind: "NEAREST",
    modes: [
      "intent-up",
      "dto-down",
      "domain-outcome",
      "persist-sot",
      "job-status",
    ],
    primaryPointId: "INTP-API-SURFACE",
    contractIds: ["C0", "C1", "C2", "C3", "C4", "C5"],
    workflowBias: ["WF-READ", "WF-COMMAND", "WF-ASYNC"],
    notes: "Nearest existing route / async status",
  },
  {
    bindingKind: "NAV",
    modes: ["intent-up", "client-nav"],
    primaryPointId: "INTP-FE-ADAPTER",
    contractIds: ["C0", "C1"],
    workflowBias: ["WF-NAV"],
    notes: "Client navigation only",
  },
  {
    bindingKind: "PREF",
    modes: ["intent-up", "client-nav"],
    primaryPointId: "INTP-FE-ADAPTER",
    contractIds: ["C0", "C1"],
    workflowBias: ["WF-NAV"],
    notes: "Client preference only",
  },
] as const satisfies readonly BindingKindExposure[];

export function getBindingKindExposure(
  bindingKind: IntegrationBindingKind,
): BindingKindExposure | undefined {
  return BINDING_KIND_EXPOSURE.find((row) => row.bindingKind === bindingKind);
}
