import type { CommandCapabilityCatalogEntry } from "./baseline-types";

export const COMMAND_PLATFORM_CAPABILITY_CATALOG: CommandCapabilityCatalogEntry[] = [
  {
    capabilityId: "command-foundation",
    releaseTag: "V4-A5-COMMAND-FOUNDATION",
    label: "Autonomous Command Platform",
    tier: "foundation",
    capabilityClass: "command-core",
    dependsOn: [],
  },
  {
    capabilityId: "command-execution-bridge",
    releaseTag: "V4-A5-A1-COMMAND-BRIDGE",
    label: "Command Execution Bridge",
    tier: "bridge",
    capabilityClass: "execution-bridge",
    dependsOn: ["command-foundation"],
  },
  {
    capabilityId: "command-hitl-control",
    releaseTag: "V4-A5-A2-HITL-CONTROL",
    label: "Human-in-the-Loop Command Control",
    tier: "hitl",
    capabilityClass: "human-control",
    dependsOn: ["command-foundation"],
  },
  {
    capabilityId: "command-hitl-bridge",
    releaseTag: "V4-A5-A3-HITL-BRIDGE",
    label: "HITL-Bridge Coordination Runtime",
    tier: "coordination",
    capabilityClass: "admission",
    dependsOn: ["command-hitl-control", "command-execution-bridge"],
  },
  {
    capabilityId: "command-platform-api",
    releaseTag: "V4-A5-A4-COMMAND-API",
    label: "Command Platform API",
    tier: "api",
    capabilityClass: "surface",
    dependsOn: ["command-hitl-bridge", "command-hitl-control", "command-execution-bridge"],
  },
  {
    capabilityId: "command-gated-orchestrator",
    releaseTag: "V4-A5-A5-GATED-ORCHESTRATOR",
    label: "Gated Bridge Orchestrator",
    tier: "orchestration",
    capabilityClass: "orchestration",
    dependsOn: ["command-platform-api", "command-hitl-bridge"],
  },
];

export const COMMAND_PLATFORM_BASELINE_VERIFY_GROUPS = [
  "autonomous-command-platform",
  "command-execution-bridge",
  "command-hitl",
  "command-hitl-bridge",
  "command-api",
  "command-gated-orchestrator",
] as const;

export const COMMAND_PLATFORM_FROZEN_LAYERS = [
  "V4-A5-COMMAND-FOUNDATION",
  "V4-A5-A1-COMMAND-BRIDGE",
  "V4-A5-A2-HITL-CONTROL",
  "V4-A5-A3-HITL-BRIDGE",
  "V4-A5-A4-COMMAND-API",
  "V4-A5-A5-GATED-ORCHESTRATOR",
] as const;

export function computeCommandManifestDigest(versions: string[]): string {
  let hash = 0;
  const joined = versions.sort().join("|");
  for (let i = 0; i < joined.length; i += 1) {
    hash = (hash * 31 + joined.charCodeAt(i)) >>> 0;
  }
  return `command-baseline-${hash.toString(16).padStart(8, "0")}`;
}
