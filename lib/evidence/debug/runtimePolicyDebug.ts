import type { RuntimePolicyAction, RuntimePolicyMetrics } from "../types";

export function formatRuntimePolicyDebug(input: {
  metrics: RuntimePolicyMetrics;
  triggeredPolicies: string[];
  actions: RuntimePolicyAction[];
  blocked: boolean;
  warnings: string[];
}): {
  summary: string;
  triggeredRules: string;
  metricsSnapshot: string;
} {
  const summary = [
    "[RuntimePolicyEngine]",
    `Triggered: ${input.triggeredPolicies.length}`,
    `Actions: ${input.actions.join(", ") || "(none)"}`,
    `Blocked: ${input.blocked}`,
    `Warnings: ${input.warnings.length}`,
  ].join("\n");

  const triggeredRules = [
    "Triggered Policies:",
    ...(input.triggeredPolicies.length
      ? input.triggeredPolicies.map((id) => `  ${id}`)
      : ["  (none)"]),
  ].join("\n");

  const metricsSnapshot = [
    "Policy Metrics:",
    ...Object.entries(input.metrics)
      .slice(0, 20)
      .map(([k, v]) => `  ${k}=${String(v)}`),
  ].join("\n");

  return { summary, triggeredRules, metricsSnapshot };
}
