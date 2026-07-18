/**
 * E07-P2 — AI Employee Runtime verification
 * Employee layer above E07 Digital Workforce Foundation
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildWorkforceFoundation,
  E07_WORKFORCE_BASE,
  E07_WORKFORCE_PLATFORM_ID,
} from "../lib/workforce/e07";
import {
  E07_EMPLOYEE_BASE,
  E07_EMPLOYEE_RUNTIME_ID,
  E07_EMPLOYEE_VERSION,
  EMPLOYEE_INSTANCE_PHASES,
  EMPLOYEE_JOB_KINDS,
  EMPLOYEE_TRACE_EVENT_KINDS,
} from "../lib/workforce/e07/employee/employee.constants";
import {
  buildEmployeeRegistryManifest,
  EMPLOYEE_CATALOG,
  getEmployeeByJobKind,
  getEmployeeById,
  listEmployeesForWorker,
} from "../lib/workforce/e07/employee/employee.registry";
import { planEmployeeTasks } from "../lib/workforce/e07/employee/employee.planner";
import {
  executeEmployee,
  executeEmployeeOrThrow,
} from "../lib/workforce/e07/employee/employee.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E07_P1 = [
  "lib/workforce/e07/core/workforce.types.ts",
  "lib/workforce/e07/core/workforce.constants.ts",
  "lib/workforce/e07/core/workforce.lifecycle.ts",
  "lib/workforce/e07/core/workforce.registry.ts",
  "lib/workforce/e07/runtime/workforce.context.ts",
  "lib/workforce/e07/runtime/workforce.executor.ts",
  "lib/workforce/e07/skill/skill.types.ts",
  "lib/workforce/e07/skill/skill.registry.ts",
  "lib/workforce/e07/index.ts",
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
    "lib/workforce/e07/employee/employee.types.ts",
    "lib/workforce/e07/employee/employee.constants.ts",
    "lib/workforce/e07/employee/employee.registry.ts",
    "lib/workforce/e07/employee/employee.planner.ts",
    "lib/workforce/e07/employee/employee.executor.ts",
    "lib/workforce/e07/employee/employee.trace.ts",
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
    E07_WORKFORCE_BASE === "enterprise-e06-autonomous-enterprise-os-freeze-v1",
    "E07-P1 base constant",
  );
  check(
    E07_EMPLOYEE_BASE === "enterprise-e07-p1-digital-workforce-foundation-v1",
    "E07-P2 base constant",
  );
  console.log("✓ upstream + E07-P1 unmodified / bases intact");
}

function testRegistryAndPlanner() {
  check(EMPLOYEE_JOB_KINDS.length === 3, "job kinds");
  check(EMPLOYEE_INSTANCE_PHASES.length === 4, "instance phases");
  check(EMPLOYEE_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(EMPLOYEE_CATALOG.length === 3, "employees");

  const manifest = buildEmployeeRegistryManifest();
  check(manifest.catalogComplete === true, "employee catalog complete");
  check(manifest.runtimeId === E07_EMPLOYEE_RUNTIME_ID, "runtime id");
  check(manifest.version === E07_EMPLOYEE_VERSION, "version");
  check(manifest.base === E07_EMPLOYEE_BASE, "base e07-p1");
  check(manifest.jobKinds.length === 3, "job kinds covered");

  check(
    getEmployeeByJobKind("specialist")?.id === "e07.employee.bid-specialist",
    "by job kind",
  );
  check(
    listEmployeesForWorker("e07.worker.auditor").length === 2,
    "employees for worker",
  );

  const specialist = getEmployeeById("e07.employee.bid-specialist")!;
  const plan = planEmployeeTasks(specialist);
  check(plan.taskCount === 3, "specialist plan tasks");
  check(plan.steps[0].workerRole === "observer", "first task observer");
  check(plan.steps[0].skillKind === "sense", "first task sense");
  check(plan.steps[2].skillKind === "verify", "last task verify");
  check(
    plan.steps.every((s, i) => s.order === i + 1),
    "task order",
  );
  check(plan.narrative.includes("3 tasks"), "narrative");
  console.log("✓ employee registry + planner");
  console.log(plan.narrative);
}

function testExecutor() {
  const specialist = getEmployeeById("e07.employee.bid-specialist")!;

  const run = executeEmployeeOrThrow(specialist, {
    input: {
      goal: "星河科技园健身中心AI员工投标专员",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e07-p2" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.completedTasks === 3, "all tasks completed");
  check(
    run.result.taskResults.every((t) => t.success && t.status === "result"),
    "task results",
  );
  check(run.result.output.jobKind === "specialist", "output job kind");

  check(run.trace.eventCount >= 8, "trace events recorded");
  for (const kind of ["plan", "task", "worker", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const employee of EMPLOYEE_CATALOG) {
    const bundle = executeEmployeeOrThrow(employee, {
      input: { goal: `probe:${employee.jobKind}`, ready: true, riskScore: 10 },
    });
    check(bundle.result.success === true, `${employee.id} success`);
    check(
      bundle.result.completedTasks === employee.tasks.length,
      `${employee.id} tasks`,
    );
  }

  // Unsafe input blocks the first task through E06 policy gate
  const blocked = executeEmployee(specialist, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(blocked.result.completedTasks === 0, "no tasks completed");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  // Broken task binding rejected at assert
  let threw = false;
  try {
    executeEmployee({
      ...specialist,
      tasks: [
        {
          workerId: "e07.worker.observer",
          skillId: "e07.skill.coordinate",
          objective: "invalid skill binding",
          readOnly: true,
        },
      ],
    });
  } catch (error) {
    threw = error instanceof Error && error.message.includes("not owned");
  }
  check(!threw, "executor returns failed bundle instead of throwing");

  const broken = executeEmployee({
    ...specialist,
    tasks: [
      {
        workerId: "e07.worker.observer",
        skillId: "e07.skill.coordinate",
        objective: "invalid skill binding",
        readOnly: true,
      },
    ],
  });
  check(broken.result.success === false, "broken binding not success");
  check(broken.result.status === "failed", "broken binding failed");

  console.log("✓ employee executor → E07 worker task sequence bridge");
}

function main() {
  console.log("E07-P2 — AI Employee Runtime Verification\n");

  const frozen = [...FROZEN_E07_P1, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E07-P1", FROZEN_E07_P1, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndPlanner();
  testExecutor();
  checkFrozen("E07-P1", FROZEN_E07_P1, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E07 P2 AI employee runtime");
}

main();
