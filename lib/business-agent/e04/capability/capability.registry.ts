/**
 * E04-P1 — Business Capability Registry
 */

import { BUSINESS_CAPABILITY_KINDS } from "../core/business-agent.constants";
import type {
  BusinessCapabilityDefinition,
  BusinessCapabilityRegistryManifest,
} from "./capability.types";

export const BUSINESS_CAPABILITY_CATALOG: BusinessCapabilityDefinition[] = [
  {
    id: "e04.cap.intake",
    kind: "intake",
    name: "Business Intake",
    description: "Normalize customer/project intake signals",
    inputHints: ["projectHint", "organizationHint", "rawBrief"],
    outputHints: ["intakeSummary", "normalizedTitle"],
    readOnly: true,
  },
  {
    id: "e04.cap.estimate",
    kind: "estimate",
    name: "Scope Estimate",
    description: "Estimate scope and high-level effort bands",
    inputHints: ["scope", "constraints"],
    outputHints: ["estimateBand", "assumptions"],
    readOnly: true,
  },
  {
    id: "e04.cap.propose",
    kind: "propose",
    name: "Solution Proposal",
    description: "Compose solution narrative for business response",
    inputHints: ["requirements", "positioning"],
    outputHints: ["proposalOutline", "valuePoints"],
    readOnly: true,
  },
  {
    id: "e04.cap.review",
    kind: "review",
    name: "Compliance Review",
    description: "Review readiness and risk flags",
    inputHints: ["draft", "checklist"],
    outputHints: ["verdict", "findings"],
    readOnly: true,
  },
  {
    id: "e04.cap.price",
    kind: "price",
    name: "Commercial Pricing",
    description: "Align pricing posture to budget signals",
    inputHints: ["budgetHint", "costDrivers"],
    outputHints: ["pricingStance", "band"],
    readOnly: true,
  },
  {
    id: "e04.cap.deliver",
    kind: "deliver",
    name: "Delivery Packaging",
    description: "Package delivery commitments and milestones",
    inputHints: ["milestones", "artifacts"],
    outputHints: ["deliveryPlan", "handoffNotes"],
    readOnly: true,
  },
  {
    id: "e04.cap.coordinate",
    kind: "coordinate",
    name: "Business Coordination",
    description: "Coordinate cross-domain business agents",
    inputHints: ["agents", "goal"],
    outputHints: ["plan", "assignments"],
    readOnly: true,
  },
];

export function buildBusinessCapabilityRegistryManifest(
  capabilities: BusinessCapabilityDefinition[] = BUSINESS_CAPABILITY_CATALOG,
): BusinessCapabilityRegistryManifest {
  const kinds = new Set(capabilities.map((c) => c.kind));
  const catalogComplete = BUSINESS_CAPABILITY_KINDS.every((k) => kinds.has(k));
  if (!catalogComplete) {
    throw new Error("Business capability catalog incomplete");
  }
  return {
    capabilityCount: capabilities.length,
    capabilities,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getCapabilityById(
  id: string,
): BusinessCapabilityDefinition | undefined {
  return BUSINESS_CAPABILITY_CATALOG.find((c) => c.id === id);
}

export function listCapabilitiesByKind(
  kind: BusinessCapabilityDefinition["kind"],
): BusinessCapabilityDefinition[] {
  return BUSINESS_CAPABILITY_CATALOG.filter((c) => c.kind === kind);
}
