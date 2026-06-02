import { CAPABILITY_FEATURE_DEPENDENCIES } from "./capability-registry";
import type { ConsumerCapabilityProfile } from "./capability-types";

export function resolveConsumerCapabilitySet(input: {
  profile: ConsumerCapabilityProfile;
  negotiationAccepted: string[];
}): { resolved: string[]; conflicts: string[]; dependencies: string[] } {
  const resolved = new Set<string>(input.negotiationAccepted);
  const dependencies: string[] = [];
  const conflicts: string[] = [];

  for (const cap of input.negotiationAccepted) {
    const deps = CAPABILITY_FEATURE_DEPENDENCIES[cap] ?? [];
    for (const dep of deps) {
      if (!input.profile.supportedFeatures.includes(dep) && !resolved.has(dep)) {
        if (input.profile.fallbackModes.includes("fallback-rendering") && dep === "canonical-payload-read") {
          resolved.add(dep);
          dependencies.push(`${cap} requires ${dep} (injected via fallback)`);
        } else {
          conflicts.push(`${cap} missing dependency ${dep}`);
        }
      } else {
        resolved.add(dep);
        dependencies.push(`${cap}->${dep}`);
      }
    }
  }

  if (
    input.profile.supportedPolicies.includes("strict") &&
    input.profile.supportedPolicies.includes("lenient")
  ) {
    conflicts.push("policy conflict: strict vs lenient");
  }

  return { resolved: [...resolved], conflicts, dependencies };
}
