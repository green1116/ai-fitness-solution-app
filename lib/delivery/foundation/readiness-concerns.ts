/**
 * PI-6.1 — Closed delivery readiness concerns (PD-7.1…PD-7.7).
 * Registry of existing readiness surfaces — invents none.
 */
export const DELIVERY_READINESS_CONCERN_IDS = [
  "RELEASE",
  "DEPLOYMENT",
  "OPERATIONAL",
  "CUSTOMER",
  "DOCUMENTATION",
  "PILOT",
  "SIGN_OFF",
] as const;

export type DeliveryReadinessConcernId =
  (typeof DELIVERY_READINESS_CONCERN_IDS)[number];

export type DeliveryReadinessConcern = Readonly<{
  concernId: DeliveryReadinessConcernId;
  order: number;
  readinessId: string;
  gateId: string;
  docPath: string;
  formula: string;
}>;

export const DELIVERY_READINESS_CONCERN_CATALOGUE = [
  {
    concernId: "RELEASE",
    order: 1,
    readinessId: "product-release-readiness-v1",
    gateId: "product-release-readiness-gate",
    docPath: "docs/product-delivery/PD-7.1-release-readiness.md",
    formula: "RELEASE_READY ∧ GNG-*",
  },
  {
    concernId: "DEPLOYMENT",
    order: 2,
    readinessId: "product-deployment-readiness-v1",
    gateId: "product-deployment-readiness-gate",
    docPath: "docs/product-delivery/PD-7.2-deployment-readiness.md",
    formula: "DEPLOY_READY_STAGING / DEPLOY_READY_PROD",
  },
  {
    concernId: "OPERATIONAL",
    order: 3,
    readinessId: "product-operational-readiness-v1",
    gateId: "product-operational-readiness-gate",
    docPath: "docs/product-delivery/PD-7.3-operational-readiness.md",
    formula: "OPERATIONALLY_READY",
  },
  {
    concernId: "CUSTOMER",
    order: 4,
    readinessId: "product-customer-readiness-v1",
    gateId: "product-customer-readiness-gate",
    docPath: "docs/product-delivery/PD-7.4-customer-readiness.md",
    formula: "CUSTOMER_READY",
  },
  {
    concernId: "DOCUMENTATION",
    order: 5,
    readinessId: "product-documentation-readiness-v1",
    gateId: "product-documentation-readiness-gate",
    docPath: "docs/product-delivery/PD-7.5-documentation-readiness.md",
    formula: "DOCUMENTATION_READY",
  },
  {
    concernId: "PILOT",
    order: 6,
    readinessId: "product-pilot-acceptance-v1",
    gateId: "product-pilot-acceptance-gate",
    docPath: "docs/product-delivery/PD-7.6-pilot-acceptance.md",
    formula: "PILOT_ACCEPT → PASS|FAIL|EXTEND",
  },
  {
    concernId: "SIGN_OFF",
    order: 7,
    readinessId: "product-delivery-sign-off-v1",
    gateId: "product-delivery-sign-off-gate",
    docPath: "docs/product-delivery/PD-7.7-delivery-sign-off.md",
    formula: "Technical|Product|Security|Operations|Customer",
  },
] as const satisfies readonly DeliveryReadinessConcern[];
