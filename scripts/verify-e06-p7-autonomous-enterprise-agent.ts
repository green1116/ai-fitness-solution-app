/**
 * E06-P7 — Autonomous Enterprise Agent verification
 * Enterprise agent layer above E06 Enterprise Digital Twin
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildOperationFoundation,
  E06_OPERATION_PLATFORM_ID,
} from "../lib/autonomous/e06";
import { buildActionRegistryManifest } from "../lib/autonomous/e06/action/action.registry";
import { buildWorkflowRegistryManifest } from "../lib/autonomous/e06/workflow/workflow.registry";
import { buildControlRegistryManifest } from "../lib/autonomous/e06/control/control.registry";
import { buildOptimizationRegistryManifest } from "../lib/autonomous/e06/optimization/optimization.registry";
import { buildTwinRegistryManifest } from "../lib/autonomous/e06/digital-twin/twin.registry";
import { E06_TWIN_BASE } from "../lib/autonomous/e06/digital-twin/twin.constants";
import {
  simulateDigitalTwinOrThrow,
} from "../lib/autonomous/e06/digital-twin/twin.engine";
import { getTwinById } from "../lib/autonomous/e06/digital-twin/twin.registry";
import {
  AGENT_DIRECTIVE_KINDS,
  AGENT_MISSIONS,
  AGENT_POSTURES,
  AGENT_TRACE_EVENT_KINDS,
  E06_AGENT_BASE,
  E06_AGENT_ID,
  E06_AGENT_VERSION,
} from "../lib/autonomous/e06/agent/agent.constants";
import {
  buildEnterpriseAgentRegistryManifest,
  ENTERPRISE_AGENT_CATALOG,
  getEnterpriseAgentById,
  getEnterpriseAgentByMission,
} from "../lib/autonomous/e06/agent/agent.registry";
import { reasonEnterpriseAgent } from "../lib/autonomous/e06/agent/agent.reasoner";
import {
  executeEnterpriseAgent,
  executeEnterpriseAgentOrThrow,
} from "../lib/autonomous/e06/agent/agent.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E06_P1_P6 = [
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/autonomous/e06/policy/operation.policy.ts",
  "lib/autonomous/e06/policy/operation.policy.registry.ts",
  "lib/autonomous/e06/index.ts",
  "lib/autonomous/e06/action/action.registry.ts",
  "lib/autonomous/e06/action/action.executor.ts",
  "lib/autonomous/e06/workflow/workflow.registry.ts",
  "lib/autonomous/e06/workflow/workflow.executor.ts",
  "lib/autonomous/e06/control/control.registry.ts",
  "lib/autonomous/e06/control/control.scheduler.ts",
  "lib/autonomous/e06/control/control.monitor.ts",
  "lib/autonomous/e06/optimization/optimization.registry.ts",
  "lib/autonomous/e06/optimization/optimization.loop.ts",
  "lib/autonomous/e06/optimization/optimization.evaluator.ts",
  "lib/autonomous/e06/digital-twin/twin.types.ts",
  "lib/autonomous/e06/digital-twin/twin.constants.ts",
  "lib/autonomous/e06/digital-twin/twin.registry.ts",
  "lib/autonomous/e06/digital-twin/twin.model.ts",
  "lib/autonomous/e06/digital-twin/twin.engine.ts",
  "lib/autonomous/e06/digital-twin/twin.trace.ts",
] as const;

const FROZEN_UPSTREAM = [
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/intelligence/e05/index.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function sha1(rel: string): string {
  return createHash("sha1")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex");
}

function checkModules() {
  const required = [
    "lib/autonomous/e06/agent/agent.types.ts",
    "lib/autonomous/e06/agent/agent.constants.ts",
    "lib/autonomous/e06/agent/agent.registry.ts",
    "lib/autonomous/e06/agent/agent.reasoner.ts",
    "lib/autonomous/e06/agent/agent.executor.ts",
    "lib/autonomous/e06/agent/agent.trace.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozen(
  label: string,
  files: readonly string[],
  baseline: Record<string, string>,
) {
  for (const rel of files) {
    check(sha1(rel) === baseline[rel], `${label} modified: ${rel}`);
  }
}

function checkBasesIntact() {
  const foundation = buildOperationFoundation();
  check(foundation.ready === true, "E06-P1 foundation still ready");
  check(
    foundation.platformId === E06_OPERATION_PLATFORM_ID,
    "E06-P1 platform id intact",
  );
  check(
    buildActionRegistryManifest().catalogComplete === true,
    "E06-P2 actions still complete",
  );
  check(
    buildWorkflowRegistryManifest().catalogComplete === true,
    "E06-P3 workflows still complete",
  );
  check(
    buildControlRegistryManifest().catalogComplete === true,
    "E06-P4 controls still complete",
  );
  check(
    buildOptimizationRegistryManifest().catalogComplete === true,
    "E06-P5 optimizations still complete",
  );
  check(
    buildTwinRegistryManifest().catalogComplete === true,
    "E06-P6 twins still complete",
  );
  check(
    E06_TWIN_BASE === "enterprise-e06-p5-self-optimization-loop-v1",
    "E06-P6 base constant",
  );
  check(
    E06_AGENT_BASE === "enterprise-e06-p6-enterprise-digital-twin-v1",
    "E06-P7 base constant",
  );
  console.log("✓ upstream + E06-P1..P6 unmodified / bases intact");
}

function testRegistryAndReasoner() {
  check(AGENT_MISSIONS.length === 3, "agent missions");
  check(AGENT_POSTURES.length === 4, "agent postures");
  check(AGENT_DIRECTIVE_KINDS.length === 4, "directive kinds");
  check(AGENT_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(ENTERPRISE_AGENT_CATALOG.length === 3, "agents");

  const manifest = buildEnterpriseAgentRegistryManifest();
  check(manifest.catalogComplete === true, "agent catalog complete");
  check(manifest.agentPlatformId === E06_AGENT_ID, "agent platform id");
  check(manifest.version === E06_AGENT_VERSION, "version");
  check(manifest.base === E06_AGENT_BASE, "base e06-p6");
  check(manifest.missions.length === 3, "missions covered");

  check(
    getEnterpriseAgentByMission("growth")?.id === "e06.agent.growth",
    "by mission",
  );
  check(
    getEnterpriseAgentById("e06.agent.stability")?.twinId === "e06.twin.risk",
    "by id",
  );

  // Reasoner over a healthy twin result → preferred posture
  const growth = getEnterpriseAgentById("e06.agent.growth")!;
  const twinRun = simulateDigitalTwinOrThrow(getTwinById(growth.twinId)!, {
    input: { goal: "reason probe", ready: true, riskScore: 10 },
  });
  const decision = reasonEnterpriseAgent(growth, twinRun.result);
  check(decision.posture === "proactive", "healthy → preferred posture");
  check(decision.directives.length === 4, "four directives");
  check(
    decision.directives.map((d) => d.kind).join(",") ===
      "observe,decide,act,monitor",
    "directive order",
  );
  check(decision.confidence >= 0.3 && decision.confidence <= 0.95, "confidence");

  // Corrective when projection is weak
  const weakTwin = {
    ...twinRun.result,
    projection: {
      ...twinRun.result.projection,
      projectedScore: 30,
      projectedHealth: "critical" as const,
      converged: false,
    },
  };
  const corrective = reasonEnterpriseAgent(growth, weakTwin);
  check(corrective.posture === "corrective", "weak twin → corrective");

  // Mismatched twin rejected
  let threw = false;
  try {
    reasonEnterpriseAgent(growth, { ...twinRun.result, twinId: "e06.twin.risk" });
  } catch (error) {
    threw = error instanceof Error && error.message.includes("mismatch");
  }
  check(threw, "agent/twin mismatch rejected");

  console.log("✓ agent registry + reasoner");
  console.log(decision.rationale);
}

function testExecutor() {
  const growth = getEnterpriseAgentById("e06.agent.growth")!;

  const run = executeEnterpriseAgentOrThrow(growth, {
    input: {
      goal: "星河科技园健身中心自主企业代理",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e06-p7" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.twin.success === true, "twin success");
  check(run.result.decision.posture === "proactive", "decision posture");
  check(run.result.decision.directives.length === 4, "decision directives");
  check(run.result.output.mission === "growth", "output mission");
  check(
    typeof run.result.output.confidence === "number",
    "output confidence",
  );

  check(run.trace.eventCount >= 5, "trace events recorded");
  for (const kind of ["twin", "reason", "decide", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const agent of ENTERPRISE_AGENT_CATALOG) {
    const bundle = executeEnterpriseAgentOrThrow(agent, {
      input: { goal: `probe:${agent.mission}`, ready: true, riskScore: 10 },
    });
    check(bundle.result.success === true, `${agent.id} success`);
    check(
      bundle.result.decision.posture === agent.preferredPosture,
      `${agent.id} preferred posture`,
    );
  }

  // Invalid definition fails fast at assert
  let threw = false;
  try {
    executeEnterpriseAgent({ ...growth, twinId: "e06.twin.missing" });
  } catch (error) {
    threw =
      error instanceof Error && error.message.includes("missing E06 twin");
  }
  check(threw, "broken agent definition rejected");

  console.log("✓ enterprise agent executor (twin → reason → decide)");
  console.log(run.result.decision.rationale);
}

function main() {
  console.log("E06-P7 — Autonomous Enterprise Agent Verification\n");

  const frozen = [...FROZEN_E06_P1_P6, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E06-P1..P6", FROZEN_E06_P1_P6, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndReasoner();
  testExecutor();
  checkFrozen("E06-P1..P6", FROZEN_E06_P1_P6, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E06 P7 autonomous enterprise agent");
}

main();
