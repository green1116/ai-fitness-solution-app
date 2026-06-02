import type { GovernanceActionCandidate } from "./types";
import type {
  GovernanceRulebookEntry,
  GovernanceRulebookMatch,
  GovernanceRulebookThreshold,
} from "./rulebook.types";

function testNumber(value: number, threshold: Extract<GovernanceRulebookThreshold, { type: "number" }>): boolean {
  switch (threshold.operator) {
    case "gt":
      return value > threshold.value;
    case "gte":
      return value >= threshold.value;
    case "lt":
      return value < threshold.value;
    case "lte":
      return value <= threshold.value;
    case "eq":
      return value === threshold.value;
    default:
      return false;
  }
}

function candidateValue(
  candidate: GovernanceActionCandidate,
  field: GovernanceRulebookEntry["triggers"][number]["field"],
): string | number | boolean {
  switch (field) {
    case "priority":
      return candidate.priority;
    case "confidence":
      return candidate.confidence;
    case "title":
      return candidate.title;
    case "kind":
      return candidate.kind;
    case "evidenceCount":
      return candidate.evidence.length;
    default:
      return "";
  }
}

function matchThreshold(value: string | number | boolean, threshold: GovernanceRulebookThreshold): boolean {
  if (threshold.type === "boolean") return value === threshold.value;
  if (threshold.type === "number") return typeof value === "number" && testNumber(value, threshold);
  if (threshold.type === "keywords") {
    return typeof value === "string" && threshold.words.some((w) => value.toLowerCase().includes(w.toLowerCase()));
  }
  if (threshold.type === "level") {
    return typeof value === "string" && threshold.allowed.includes(value as "low" | "medium" | "high" | "critical");
  }
  if (threshold.type === "enum") {
    return typeof value === "string" && threshold.allowed.includes(value);
  }
  return false;
}

function triggerAppliesToCandidate(
  trigger: GovernanceRulebookEntry["triggers"][number],
  candidate: GovernanceActionCandidate,
): boolean {
  if (trigger.scope !== "any" && candidate.kind !== trigger.scope) return false;
  const val = candidateValue(candidate, trigger.field);
  return matchThreshold(val, trigger.threshold);
}

function candidateMatchesAllTriggers(
  entry: GovernanceRulebookEntry,
  candidate: GovernanceActionCandidate,
): boolean {
  const applicable = entry.triggers.filter(
    (trigger) => trigger.scope === "any" || trigger.scope === candidate.kind,
  );
  if (applicable.length === 0) return false;
  return applicable.every((trigger) => triggerAppliesToCandidate(trigger, candidate));
}

export function matchRulebookEntry(
  entry: GovernanceRulebookEntry,
  candidates: GovernanceActionCandidate[],
): GovernanceRulebookMatch {
  const hits: string[] = [];
  for (const candidate of candidates) {
    if (candidateMatchesAllTriggers(entry, candidate)) {
      hits.push(candidate.candidateId);
    }
  }
  return {
    ruleId: entry.ruleId,
    matched: hits.length > 0,
    reason: hits.length > 0 ? entry.triggerReason : "No candidate matched rulebook triggers.",
    candidateIds: hits,
    actions: entry.actions,
  };
}
