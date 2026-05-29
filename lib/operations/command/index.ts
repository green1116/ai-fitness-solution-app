export * from "./types";
export * from "./policy";
export * from "./routing";
export * from "./authority";
export * from "./delegation";
export * from "./coordination";
export * from "./audit";
export * from "./intelligence";
export * from "./center";
export * from "./bridge";
export * from "./hitl";
export * from "./hitl-bridge";

import {
  AUTONOMOUS_COMMAND_PLATFORM_VERSION,
  type AutonomousCommandRuntimeInput,
  type AutonomousCommandRuntimeResult,
  type CommandStatus,
} from "./types";
import { assembleCommandPipeline, buildCommandCenter } from "./center";

const COMMAND_LOOP_PHASES = [
  "observe",
  "analyze",
  "predict",
  "recommend",
  "command",
  "approve",
  "coordinate",
  "execute",
  "recover",
  "operate",
] as const;

export type AutonomousCommandRuntime = AutonomousCommandRuntimeResult;

export function buildAutonomousCommandRuntime(
  input: AutonomousCommandRuntimeInput,
): AutonomousCommandRuntimeResult {
  const pipeline = assembleCommandPipeline({
    deploymentId: input.deploymentId,
    operations: input.operations,
  });

  const center = buildCommandCenter({
    deploymentId: input.deploymentId,
    operations: input.operations,
    ...pipeline,
  });

  const denied = pipeline.policyEvaluations.some((e) => e.effect === "deny" && !e.allowed);
  const blocked = pipeline.coordinations.some((c) => c.status === "blocked");
  let status: CommandStatus = "completed";
  if (denied) status = "denied";
  else if (blocked) status = "failed";
  else if (pipeline.delegations.length > 0) status = "delegated";

  const flags = {
    commandCenter: center.intents.length > 0,
    policy: pipeline.policyEvaluations.length > 0,
    routing: pipeline.routes.length > 0,
    authority: pipeline.authorityEvaluations.length > 0,
    delegation: pipeline.delegations.length >= 0,
    coordination: pipeline.coordinations.length > 0,
    audit: pipeline.audit.records.length > 0,
    intelligence: pipeline.intelligence.totalIntents >= 0,
  };

  return {
    version: AUTONOMOUS_COMMAND_PLATFORM_VERSION,
    center,
    intents: pipeline.intents,
    policyEvaluations: pipeline.policyEvaluations,
    routes: pipeline.routes,
    authorityEvaluations: pipeline.authorityEvaluations,
    delegations: pipeline.delegations,
    coordinations: pipeline.coordinations,
    audit: pipeline.audit,
    intelligence: pipeline.intelligence,
    loop: {
      phases: [...COMMAND_LOOP_PHASES],
      currentPhase: "operate",
      closed: true,
    },
    flags,
    summary: {
      summaryId: center.summary.summaryId,
      text: center.summary.text,
      traceId: `command-trace-${input.deploymentId}`,
    },
    status,
  };
}
