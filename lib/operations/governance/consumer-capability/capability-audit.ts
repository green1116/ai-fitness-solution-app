import type { CapabilityAuditRecord, CapabilityNegotiationResult } from "./capability-types";

export function buildCapabilityAuditRecords(
  negotiation: CapabilityNegotiationResult,
): CapabilityAuditRecord[] {
  const timestamp = new Date().toISOString();
  return [
    {
      negotiationId: negotiation.negotiationId,
      consumerId: negotiation.consumerId,
      decision: negotiation.governanceDecision,
      reason: negotiation.auditTrail.join("; ") || "negotiation complete",
      compatibilityScore: negotiation.compatibilityScore,
      degradedCapabilities: negotiation.downgradedCapabilities,
      timestamp,
    },
    ...negotiation.rejectedCapabilities.map((cap, index) => ({
      negotiationId: negotiation.negotiationId,
      consumerId: negotiation.consumerId,
      decision: "rejected_capability",
      reason: `Rejected capability: ${cap}`,
      compatibilityScore: negotiation.compatibilityScore,
      degradedCapabilities: negotiation.downgradedCapabilities,
      timestamp: `${timestamp}-${index}`,
    })),
  ];
}
