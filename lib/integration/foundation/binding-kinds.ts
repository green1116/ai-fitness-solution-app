/**
 * PI-5.1 — Binding kinds at the integration seam (PD-6.1 §2.2).
 * Closed set — matches PD-2.4 / PI-3.4 kinds.
 */
export const INTEGRATION_BINDING_KINDS = [
  "API",
  "API+NAV",
  "NEAREST",
  "NAV",
  "PREF",
] as const;

export type IntegrationBindingKind =
  (typeof INTEGRATION_BINDING_KINDS)[number];

export type BindingKindRecord = Readonly<{
  kind: IntegrationBindingKind;
  traversesHttp: boolean;
  touchesDomain: boolean;
  behavior: string;
}>;

export const INTEGRATION_BINDING_KIND_CATALOGUE = [
  {
    kind: "API",
    traversesHttp: true,
    touchesDomain: true,
    behavior: "Full chain through Domain",
  },
  {
    kind: "API+NAV",
    traversesHttp: true,
    touchesDomain: true,
    behavior: "Full chain; FE navigates after success",
  },
  {
    kind: "NEAREST",
    traversesHttp: true,
    touchesDomain: true,
    behavior: "Same chain on documented nearest existing route",
  },
  {
    kind: "NAV",
    traversesHttp: false,
    touchesDomain: false,
    behavior: "FE-only navigation; no Domain HTTP",
  },
  {
    kind: "PREF",
    traversesHttp: false,
    touchesDomain: false,
    behavior: "FE-only preference; no Domain HTTP",
  },
] as const satisfies readonly BindingKindRecord[];

export function bindingKindTouchesDomain(
  kind: IntegrationBindingKind,
): boolean {
  return INTEGRATION_BINDING_KIND_CATALOGUE.find((row) => row.kind === kind)
    ?.touchesDomain ?? false;
}
