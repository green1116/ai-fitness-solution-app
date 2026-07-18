/**
 * E07-P4 — Workforce Orchestration verification
 * Multi-employee orchestration above E07 Role Agent Marketplace
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildWorkforceFoundation,
  E07_WORKFORCE_PLATFORM_ID,
} from "../lib/workforce/e07";
import { buildEmployeeRegistryManifest } from "../lib/workforce/e07/employee/employee.registry";
import { buildRoleRegistryManifest } from "../lib/workforce/e07/marketplace/role.registry";
import { E07_MARKETPLACE_BASE } from "../lib/workforce/e07/marketplace/role.constants";
import {
  E07_ORCHESTRATION_BASE,
  E07_ORCHESTRATION_ID,
  E07_ORCHESTRATION_VERSION,
  ORCHESTRATION_INSTANCE_PHASES,
  ORCHESTRATION_KINDS,
  ORCHESTRATION_TRACE_EVENT_KINDS,
} from "../lib/workforce/e07/orchestration/orchestration.constants";
import {
  buildOrchestrationRegistryManifest,
  getOrchestrationById,
  getOrchestrationByKind,
  ORCHESTRATION_CATALOG,
} from "../lib/workforce/e07/orchestration/orchestration.registry";
import { planOrchestration } from "../lib/workforce/e07/orchestration/orchestration.planner";
import {
  executeOrchestration,
  executeOrchestrationOrThrow,
} from "../lib/workforce/e07/orchestration/orchestration.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E07_P1_P3 = [
  "lib/workforce/e07/core/workforce.types.ts",
  "lib/workforce/e07/core/workforce.constants.ts",
  "lib/workforce/e07/core/workforce.lifecycle.ts",
  "lib/workforce/e07/core/workforce.registry.ts",
  "lib/workforce/e07/runtime/workforce.context.ts",
  "lib/workforce/e07/runtime/workforce.executor.ts",
  "lib/workforce/e07/skill/skill.types.ts",
  "lib/workforce/e07/skill/skill.registry.ts",
  "lib/workforce/e07/index.ts",
  "lib/workforce/e07/employee/employee.types.ts",
  "lib/workforce/e07/employee/employee.constants.ts",
  "lib/workforce/e07/employee/employee.registry.ts",
  "lib/workforce/e07/employee/employee.planner.ts",
  "lib/workforce/e07/employee/employee.executor.ts",
  "lib/workforce/e07/employee/employee.trace.ts",
  "lib/workforce/e07/marketplace/role.types.ts",
  "lib/workforce/e07/marketplace/role.constants.ts",
  "lib/workforce/e07/marketplace/role.registry.ts",
  "lib/workforce/e07/marketplace/role.catalog.ts",
  "lib/workforce/e07/marketplace/role.deployer.ts",
  "lib/workforce/e07/marketplace/role.trace.ts",
] as const;

const FROZEN_UPSTREAM = [
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/autonomous/e06/index.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
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
    "lib/workforce/e07/orchestration/orchestration.types.ts",
    "lib/workforce/e07/orchestration/orchestration.constants.ts",
    "lib/workforce/e07/orchestration/orchestration.registry.ts",
    "lib/workforce/e07/orchestration/orchestration.planner.ts",
    "lib/workforce/e07/orchestration/orchestration.executor.ts",
    "lib/workforce/e07/orchestration/orchestration.trace.ts",
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
  const foundation = buildWorkforceFoundation();
  check(foundation.ready === true, "E07-P1 foundation still ready");
  check(
    foundation.platformId === E07_WORKFORCE_PLATFORM_ID,
    "E07-P1 platform id intact",
  );
  check(
    buildEmployeeRegistryManifest().catalogComplete === true,
    "E07-P2 employees still complete",
  );
  check(
    buildRoleRegistryManifest().catalogComplete === true,
    "E07-P3 roles still complete",
  );
  check(
    E07_MARKETPLACE_BASE === "enterprise-e07-p2-ai-employee-runtime-v1",
    "E07-P3 base constant",
  );
  check(
    E07_ORCHESTRATION_BASE === "enterprise-e07-p3-role-agent-marketplace-v1",
    "E07-P4 base constant",
  );
  console.log("✓ upstream + E07-P1/P2/P3 unmodified / bases intact");
}

function testRegistryAndPlanner() {
  check(ORCHESTRATION_KINDS.length === 3, "orchestration kinds");
  check(ORCHESTRATION_INSTANCE_PHASES.length === 4, "instance phases");
  check(ORCHESTRATION_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(ORCHESTRATION_CATALOG.length === 3, "orchestrations");

  const manifest = buildOrchestrationRegistryManifest();
  check(manifest.catalogComplete === true, "orchestration catalog complete");
  check(manifest.orchestrationId === E07_ORCHESTRATION_ID, "orchestration id");
  check(manifest.version === E07_ORCHESTRATION_VERSION, "version");
  check(manifest.base === E07_ORCHESTRATION_BASE, "base e07-p3");
  check(manifest.kinds.length === 3, "kinds covered");

  check(
    getOrchestrationByKind("campaign")?.id === "e07.orch.enterprise-campaign",
    "by kind",
  );

  const campaign = getOrchestrationById("e07.orch.enterprise-campaign")!;
  const plan = planOrchestration(campaign);
  check(plan.stepCount === 2, "campaign plan steps");
  check(plan.steps[0].roleCategory === "commercial", "first commercial");
  check(plan.steps[1].roleCategory === "risk", "second risk");
  check(
    plan.steps.every((s, i) => s.order === i + 1),
    "step order",
  );
  check(plan.narrative.includes("2 role deployments"), "narrative");
  console.log("✓ orchestration registry + planner");
  console.log(plan.narrative);
}

function testExecutor() {
  const campaign = getOrchestrationById("e07.orch.enterprise-campaign")!;

  const run = executeOrchestrationOrThrow(campaign, {
    input: {
      goal: "星河科技园健身中心劳动力编排",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e07-p4" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.completedSteps === 2, "all steps completed");
  check(run.result.deployedRoles.length === 2, "roles deployed");
  check(
    run.result.deployedRoles.includes("e07.role.bid-agent"),
    "bid deployed",
  );
  check(
    run.result.stepResults.every((s) => s.success && s.status === "result"),
    "step results",
  );

  check(run.trace.eventCount >= 6, "trace events recorded");
  for (const kind of ["plan", "step", "deploy", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const orchestration of ORCHESTRATION_CATALOG) {
    const bundle = executeOrchestrationOrThrow(orchestration, {
      input: {
        goal: `probe:${orchestration.kind}`,
        ready: true,
        riskScore: 10,
      },
    });
    check(bundle.result.success === true, `${orchestration.id} success`);
    check(
      bundle.result.completedSteps === orchestration.roleIds.length,
      `${orchestration.id} steps`,
    );
  }

  const blocked = executeOrchestration(campaign, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(blocked.result.completedSteps === 0, "no steps completed");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  // Unknown role rejected at assert (via plan/execute catch → failed)
  const broken = executeOrchestration({
    ...campaign,
    roleIds: ["e07.role.missing"],
  });
  check(broken.result.success === false, "broken not success");
  check(broken.result.status === "failed", "broken failed");

  console.log("✓ orchestration executor → E07 role deploy sequence");
}

function main() {
  console.log("E07-P4 — Workforce Orchestration Verification\n");

  const frozen = [...FROZEN_E07_P1_P3, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E07-P1/P2/P3", FROZEN_E07_P1_P3, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndPlanner();
  testExecutor();
  checkFrozen("E07-P1/P2/P3", FROZEN_E07_P1_P3, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E07 P4 workforce orchestration");
}

main();
