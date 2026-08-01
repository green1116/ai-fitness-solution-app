/**
 * AE-4 — Declarative integration bindings.
 * Binding catalogue only — no executors / business handlers / monitoring hooks.
 */
import type { Ae4SeamFamilyId } from "./integration.registry";

export const AE4_BINDING_IDS = [
  "B-FE-BE",
  "B-BE-DATA",
  "B-BE-DOMAIN",
  "B-FE-DOMAIN",
  "B-INT-STACK",
  "B-DEL-STACK",
] as const;

export type Ae4BindingId = (typeof AE4_BINDING_IDS)[number];

export type Ae4IntegrationBinding = Readonly<{
  bindingId: Ae4BindingId;
  familyId: Ae4SeamFamilyId;
  direction: "bidirectional" | "left-to-right" | "right-to-left";
  notes: string;
}>;

/**
 * Closed bindings — one per seam family.
 */
export const AE4_INTEGRATION_BINDINGS = [
  {
    bindingId: "B-FE-BE",
    familyId: "FE_BE",
    direction: "bidirectional",
    notes: "FE adapter ↔ BE API edge",
  },
  {
    bindingId: "B-BE-DATA",
    familyId: "BE_DATA",
    direction: "left-to-right",
    notes: "BE services → Data ports",
  },
  {
    bindingId: "B-BE-DOMAIN",
    familyId: "BE_DOMAIN",
    direction: "bidirectional",
    notes: "BE ↔ Domain ports",
  },
  {
    bindingId: "B-FE-DOMAIN",
    familyId: "FE_DOMAIN",
    direction: "right-to-left",
    notes: "Domain outcomes → FE presentation",
  },
  {
    bindingId: "B-INT-STACK",
    familyId: "INT_STACK",
    direction: "left-to-right",
    notes: "Integration evidence → Closure",
  },
  {
    bindingId: "B-DEL-STACK",
    familyId: "DELIVERY_STACK",
    direction: "left-to-right",
    notes: "Delivery readiness → Implementation registry",
  },
] as const satisfies readonly Ae4IntegrationBinding[];

export function getAe4IntegrationBinding(
  bindingId: Ae4BindingId,
): Ae4IntegrationBinding | undefined {
  return AE4_INTEGRATION_BINDINGS.find((b) => b.bindingId === bindingId);
}
