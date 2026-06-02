import type { ExpansionKind, ExpansionOpportunity } from "./types";

const EXPANSION_DEFINITIONS: readonly Omit<ExpansionOpportunity, "opportunityId" | "customerId">[] = [
  {
    kind: "seat",
    label: "Seat Expansion",
    estimatedValue: 120000,
    probability: 65,
    summary: "Add licensed users across regional teams",
  },
  {
    kind: "workspace",
    label: "Workspace Expansion",
    estimatedValue: 180000,
    probability: 58,
    summary: "Expand from 5 to 12 workspaces for multi-site rollout",
  },
  {
    kind: "feature",
    label: "Feature Expansion",
    estimatedValue: 96000,
    probability: 70,
    summary: "Enable tender package and advanced proposal workflows",
  },
  {
    kind: "enterprise-upgrade",
    label: "Enterprise Upgrade",
    estimatedValue: 640000,
    probability: 45,
    summary: "Upgrade Professional tier to Enterprise with unlimited entitlements",
  },
];

export function buildExpansionOpportunity(input?: {
  deploymentId?: string;
  customerId?: string;
  kind?: ExpansionKind;
}): ExpansionOpportunity {
  const deploymentId = input?.deploymentId ?? "expansion-renewal-default";
  const customerId = input?.customerId ?? `customer-${deploymentId}`;
  const kind = input?.kind ?? "enterprise-upgrade";
  const definition = EXPANSION_DEFINITIONS.find((d) => d.kind === kind);
  if (!definition) {
    throw new Error(`Unknown expansion kind: ${kind}`);
  }
  return {
    opportunityId: `expansion-opp-${kind}-${deploymentId}`,
    customerId,
    ...definition,
  };
}

export function buildExpansionOpportunities(input?: {
  deploymentId?: string;
  customerId?: string;
}): ExpansionOpportunity[] {
  const deploymentId = input?.deploymentId ?? "expansion-renewal-default";
  const customerId = input?.customerId ?? `customer-${deploymentId}`;
  return EXPANSION_DEFINITIONS.map((def) => ({
    opportunityId: `expansion-opp-${def.kind}-${deploymentId}`,
    customerId,
    ...def,
  }));
}
