import type { RuntimeEventDispatchRecord, RuntimeEventType } from "../types";
import { KNOWN_CAUSAL_CHAINS } from "./constants";
import type {
  EventCorrelationEdge,
  EventCorrelationGroup,
  EventCorrelationIntelligence,
} from "./types";
import type { EventTimelineIntelligence } from "./types";

function edgeKey(from: RuntimeEventType, to: RuntimeEventType) {
  return `${from}→${to}`;
}

export function buildEventCorrelationIntelligence(
  records: RuntimeEventDispatchRecord[],
  timeline: EventTimelineIntelligence,
): EventCorrelationIntelligence {
  const edgeMap = new Map<string, EventCorrelationEdge>();

  function addEdge(
    from: RuntimeEventType,
    to: RuntimeEventType,
    relationship: EventCorrelationEdge["relationship"],
    reason: string,
    weight = 1,
  ) {
    const key = edgeKey(from, to);
    const existing = edgeMap.get(key);
    if (existing) {
      existing.count += 1;
      existing.weight = Math.min(1, existing.weight + weight * 0.1);
    } else {
      edgeMap.set(key, {
        from,
        to,
        count: 1,
        weight: Math.min(1, weight),
        relationship,
        reason,
      });
    }
  }

  for (const chain of KNOWN_CAUSAL_CHAINS) {
    for (let i = 0; i < chain.chain.length - 1; i += 1) {
      const from = chain.chain[i]!;
      const to = chain.chain[i + 1]!;
      const present =
        timeline.orderedSteps.some((s) => s.eventType === from) &&
        timeline.orderedSteps.some((s) => s.eventType === to);
      if (present) {
        addEdge(from, to, "causal", chain.reason, 0.85);
      }
    }
  }

  const byId = new Map(records.map((r) => [r.eventId, r]));
  for (const r of records) {
    for (const childId of r.childEventIds) {
      const child = byId.get(childId);
      if (child) {
        addEdge(
          r.eventType,
          child.eventType,
          "downstream",
          "parent-child-event-link",
          0.9,
        );
        addEdge(
          child.eventType,
          r.eventType,
          "upstream",
          "child-to-parent",
          0.5,
        );
      }
    }
  }

  const steps = timeline.orderedSteps;
  for (let i = 0; i < steps.length - 1; i += 1) {
    const from = steps[i]!.eventType;
    const to = steps[i + 1]!.eventType;
    if (from !== to) {
      addEdge(from, to, "co-occur", "sequential-timeline-adjacency", 0.4);
    }
  }

  const pairs: Array<[RuntimeEventType, RuntimeEventType, string]> = [
    ["VALIDATION_FAILED", "GOVERNANCE_ESCALATED", "validation-triggers-governance"],
    ["GOVERNANCE_ESCALATED", "RELEASE_BLOCKED", "governance-freezes-release"],
    ["AUDIT_REJECTED", "RELEASE_BLOCKED", "audit-blocks-release"],
    ["AUDIT_APPROVED", "EXECUTIVE_REVIEW_UNLOCKED", "audit-unlocks-executive"],
    ["EXECUTIVE_APPROVED", "MANIFEST_GENERATION_REQUESTED", "executive-manifest"],
  ];
  for (const [from, to, reason] of pairs) {
    const hasBoth =
      steps.some((s) => s.eventType === from) &&
      steps.some((s) => s.eventType === to);
    if (hasBoth) addEdge(from, to, "causal", reason, 0.75);
  }

  const edges = [...edgeMap.values()].sort((a, b) => b.weight - a.weight);

  const upstreamMap: Partial<Record<RuntimeEventType, RuntimeEventType[]>> =
    {};
  const downstreamMap: Partial<
    Record<RuntimeEventType, RuntimeEventType[]>
  > = {};
  for (const e of edges) {
    if (e.relationship === "upstream" || e.relationship === "causal") {
      const list = downstreamMap[e.from] ?? [];
      if (!list.includes(e.to)) list.push(e.to);
      downstreamMap[e.from] = list;
    }
    if (e.relationship === "downstream" || e.relationship === "causal") {
      const list = upstreamMap[e.to] ?? [];
      if (!list.includes(e.from)) list.push(e.from);
      upstreamMap[e.to] = list;
    }
  }

  const relatedGroups: EventCorrelationGroup[] = [];
  for (const chain of KNOWN_CAUSAL_CHAINS) {
    const present = chain.chain.filter((t) =>
      steps.some((s) => s.eventType === t),
    );
    if (present.length >= 2) {
      relatedGroups.push({
        events: present,
        reason: chain.reason,
        strength: present.length / chain.chain.length,
      });
    }
  }

  if (
    steps.some((s) => s.eventType === "VALIDATION_FAILED") &&
    steps.some((s) => s.eventType === "RELEASE_BLOCKED")
  ) {
    relatedGroups.push({
      events: ["VALIDATION_FAILED", "GOVERNANCE_ESCALATED", "RELEASE_BLOCKED"],
      reason: "validation-to-release-freeze-cluster",
      strength: 0.8,
    });
  }

  return {
    edges,
    relatedGroups,
    upstreamMap,
    downstreamMap,
  };
}
