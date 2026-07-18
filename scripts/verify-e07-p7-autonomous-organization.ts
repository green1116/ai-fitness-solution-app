/**
 * E07-P7 — Autonomous Organization verification
 * Organization layer above E07 Workforce Learning Loop
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
import { buildOrchestrationRegistryManifest } from "../lib/workforce/e07/orchestration/orchestration.registry";
import { buildCollaborationRegistryManifest } from "../lib/workforce/e07/collaboration/collaboration.registry";
import { buildLearningRegistryManifest } from "../lib/workforce/e07/learning/learning.registry";
import { E07_LEARNING_BASE } from "../lib/workforce/e07/learning/learning.constants";
import {
  E07_ORGANIZATION_BASE,
  E07_ORGANIZATION_ID,
  E07_ORGANIZATION_VERSION,
  ORGANIZATION_INSTANCE_PHASES,
  ORGANIZATION_KINDS,
  ORGANIZATION_TRACE_EVENT_KINDS,
} from "../lib/workforce/e07/organization/organization.constants";
import {
  buildOrganizationRegistryManifest,
  getOrganizationById,
  getOrganizationByKind,
  ORGANIZATION_CATALOG,
} from "../lib/workforce/e07/organization/organization.registry";
import { planOrganization } from "../lib/workforce/e07/organization/organization.planner";
import {
  executeOrganization,
  executeOrganizationOrThrow,
} from "../lib/workforce/e07/organization/organization.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E07_P1_P6 = [
  "lib/workforce/e07/core/workforce.registry.ts",
  "lib/workforce/e07/runtime/workforce.executor.ts",
  "lib/workforce/e07/skill/skill.registry.ts",
  "lib/workforce/e07/index.ts",
  "lib/workforce/e07/employee/employee.registry.ts",
  "lib/workforce/e07/employee/employee.executor.ts",
  "lib/workforce/e07/marketplace/role.registry.ts",
  "lib/workforce/e07/marketplace/role.deployer.ts",
  "lib/workforce/e07/orchestration/orchestration.registry.ts",
  "lib/workforce/e07/orchestration/orchestration.executor.ts",
  "lib/workforce/e07/collaboration/collaboration.registry.ts",
  "lib/workforce/e07/collaboration/collaboration.executor.ts",
  "lib/workforce/e07/learning/learning.types.ts",
  "lib/workforce/e07/learning/learning.constants.ts",
  "lib/workforce/e07/learning/learning.registry.ts",
  "lib/workforce/e07/learning/learning.evaluator.ts",
  "lib/workforce/e07/learning/learning.updater.ts",
  "lib/workforce/e07/learning/learning.trace.ts",
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
    "lib/workforce/e07/organization/organization.types.ts",
    "lib/workforce/e07/organization/organization.constants.ts",
    "lib/workforce/e07/organization/organization.registry.ts",
    "lib/workforce/e07/organization/organization.planner.ts",
    "lib/workforce/e07/organization/organization.executor.ts",
    "lib/workforce/e07/organization/organization.trace.ts",
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
    buildOrchestrationRegistryManifest().catalogComplete === true,
    "E07-P4 orchestrations still complete",
  );
  check(
    buildCollaborationRegistryManifest().catalogComplete === true,
    "E07-P5 collaborations still complete",
  );
  check(
    buildLearningRegistryManifest().catalogComplete === true,
    "E07-P6 learnings still complete",
  );
  check(
    E07_LEARNING_BASE === "enterprise-e07-p5-human-ai-collaboration-v1",
    "E07-P6 base constant",
  );
  check(
    E07_ORGANIZATION_BASE === "enterprise-e07-p6-workforce-learning-loop-v1",
    "E07-P7 base constant",
  );
  console.log("✓ upstream + E07-P1..P6 unmodified / bases intact");
}

function testRegistryAndPlanner() {
  check(ORGANIZATION_KINDS.length === 3, "organization kinds");
  check(ORGANIZATION_INSTANCE_PHASES.length === 4, "instance phases");
  check(ORGANIZATION_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(ORGANIZATION_CATALOG.length === 3, "organizations");

  const manifest = buildOrganizationRegistryManifest();
  check(manifest.catalogComplete === true, "organization catalog complete");
  check(manifest.organizationId === E07_ORGANIZATION_ID, "organization id");
  check(manifest.version === E07_ORGANIZATION_VERSION, "version");
  check(manifest.base === E07_ORGANIZATION_BASE, "base e07-p6");
  check(manifest.kinds.length === 3, "kinds covered");

  check(
    getOrganizationByKind("division")?.id === "e07.org.commercial-division",
    "by kind",
  );

  const enterprise = getOrganizationById("e07.org.enterprise-os")!;
  const plan = planOrganization(enterprise);
  check(plan.unitCount === 3, "enterprise plan units");
  check(plan.units[0].learningKind === "outcome", "first outcome");
  check(plan.units[2].learningKind === "handoff", "last handoff");
  check(
    plan.units.every((u, i) => u.order === i + 1),
    "unit order",
  );
  check(plan.narrative.includes("3 learning units"), "narrative");
  console.log("✓ organization registry + planner");
  console.log(plan.narrative);
}

function testExecutor() {
  const division = getOrganizationById("e07.org.commercial-division")!;

  const run = executeOrganizationOrThrow(division, {
    input: {
      goal: "星河科技园健身中心自治组织",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
      humanDecision: "approve",
    },
    metadata: { source: "verify-e07-p7" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.completedUnits === 1, "all units completed");
  check(
    run.result.learningIds.includes("e07.learn.campaign-outcome"),
    "learning collected",
  );
  check(
    run.result.unitResults.every((u) => u.success && u.status === "result"),
    "unit results",
  );
  check(run.result.unitResults[0].updatedScore === 100, "unit score");

  check(run.trace.eventCount >= 5, "trace events recorded");
  for (const kind of ["plan", "unit", "learn", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const organization of ORGANIZATION_CATALOG) {
    const bundle = executeOrganizationOrThrow(organization, {
      input: {
        goal: `probe:${organization.kind}`,
        ready: true,
        riskScore: 10,
        humanDecision: "approve",
      },
    });
    check(bundle.result.success === true, `${organization.id} success`);
    check(
      bundle.result.completedUnits === organization.learningIds.length,
      `${organization.id} units`,
    );
  }

  // Broken learning binding fails via plan assert catch
  const broken = executeOrganization({
    ...division,
    learningIds: ["e07.learn.missing"],
  });
  check(broken.result.success === false, "broken not success");
  check(broken.result.status === "failed", "broken failed");

  console.log("✓ organization executor → E07 learning unit sequence");
}

function main() {
  console.log("E07-P7 — Autonomous Organization Verification\n");

  const frozen = [...FROZEN_E07_P1_P6, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E07-P1..P6", FROZEN_E07_P1_P6, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndPlanner();
  testExecutor();
  checkFrozen("E07-P1..P6", FROZEN_E07_P1_P6, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E07 P7 autonomous organization");
}

main();
