import type {
  CommandAuditTrail,
  CommandAuthorityEvaluation,
  CommandIntent,
  CommandIntelligenceProfile,
  CommandPolicyEvaluation,
} from "./types";

export function buildCommandIntelligence(input: {
  deploymentId: string;
  intents: CommandIntent[];
  policyEvaluations: CommandPolicyEvaluation[];
  authorityEvaluations: CommandAuthorityEvaluation[];
  audit: CommandAuditTrail;
}): CommandIntelligenceProfile {
  const nameCounts = new Map<string, number>();
  for (const intent of input.intents) {
    nameCounts.set(intent.name, (nameCounts.get(intent.name) ?? 0) + 1);
  }

  const highFrequencyCommands = [...nameCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([name]) => name);

  const conflictCommands = input.intents
    .filter((intent) => intent.severity === "critical" && intent.domain === "cross-domain")
    .map((intent) => intent.name);

  const duplicateCommands = [...nameCounts.values()].filter((c) => c > 1).length;

  const unauthorizedAttempts = input.authorityEvaluations.filter((e) => !e.authorized).length;

  const inefficientCommands = input.policyEvaluations.filter(
    (e) => e.effect === "require-coordination" && e.allowed,
  ).length;

  let trend: CommandIntelligenceProfile["trend"] = "stable";
  if (input.intents.length > 8) trend = "increasing";
  else if (input.intents.length <= 3) trend = "decreasing";

  return {
    profileId: `command-intelligence-${input.deploymentId}`,
    totalIntents: input.intents.length,
    highFrequencyCommands,
    conflictCommands,
    duplicateCommands,
    unauthorizedAttempts,
    inefficientCommands,
    trend,
    summary: `intents=${input.intents.length} duplicates=${duplicateCommands} unauthorized=${unauthorizedAttempts} audit=${input.audit.records.length}`,
  };
}
