/**
 * E06-P2 — Business Action Runtime verification
 * Action execution layer above E06 Autonomous Operation Foundation
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildOperationFoundation,
  E06_OPERATION_BASE,
  E06_OPERATION_PLATFORM_ID,
  E06_OPERATION_VERSION,
} from "../lib/autonomous/e06";
import {
  E06_ACTION_BASE,
  E06_ACTION_RUNTIME_ID,
  E06_ACTION_VERSION,
  ACTION_INSTANCE_PHASES,
  ACTION_KINDS,
  ACTION_TRACE_EVENT_KINDS,
} from "../lib/autonomous/e06/action/action.constants";
import {
  ACTION_CATALOG,
  buildActionRegistryManifest,
  getActionById,
  getActionByKind,
  listActionsForOperation,
} from "../lib/autonomous/e06/action/action.registry";
import {
  executeBusinessAction,
  executeBusinessActionOrThrow,
} from "../lib/autonomous/e06/action/action.executor";
import {
  assertActionResultPass,
  summarizeActionResult,
} from "../lib/autonomous/e06/action/action.result";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E06_P1 = [
  "lib/autonomous/e06/core/operation.types.ts",
  "lib/autonomous/e06/core/operation.constants.ts",
  "lib/autonomous/e06/core/operation.lifecycle.ts",
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.context.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/autonomous/e06/policy/operation.policy.ts",
  "lib/autonomous/e06/policy/operation.policy.registry.ts",
  "lib/autonomous/e06/index.ts",
] as const;

const FROZEN_E05 = [
  "lib/intelligence/e05/core/intelligence.types.ts",
  "lib/intelligence/e05/core/intelligence.constants.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/intelligence/e05/index.ts",
] as const;

const FROZEN_E04 = [
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
] as const;

const FROZEN_E03 = [
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
    "lib/autonomous/e06/action/action.types.ts",
    "lib/autonomous/e06/action/action.constants.ts",
    "lib/autonomous/e06/action/action.registry.ts",
    "lib/autonomous/e06/action/action.executor.ts",
    "lib/autonomous/e06/action/action.result.ts",
    "lib/autonomous/e06/action/action.trace.ts",
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
  check(foundation.version === E06_OPERATION_VERSION, "E06-P1 version intact");
  check(
    E06_OPERATION_BASE === "enterprise-e05-intelligence-platform-freeze-v1",
    "E06-P1 base constant",
  );
  check(
    E06_ACTION_BASE === "enterprise-e06-p1-autonomous-operation-foundation-v1",
    "E06-P2 base constant",
  );
  console.log("✓ E03 + E04 + E05 + E06-P1 unmodified / bases intact");
}

function testRegistry() {
  check(ACTION_INSTANCE_PHASES.length === 4, "instance phases");
  check(ACTION_KINDS.length === 6, "action kinds");
  check(ACTION_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(ACTION_CATALOG.length === 6, "actions");

  const manifest = buildActionRegistryManifest();
  check(manifest.catalogComplete === true, "action catalog complete");
  check(manifest.runtimeId === E06_ACTION_RUNTIME_ID, "runtime id");
  check(manifest.version === E06_ACTION_VERSION, "version");
  check(manifest.base === E06_ACTION_BASE, "base e06-p1");
  check(manifest.actionCount === 6, "action count");
  check(manifest.kinds.length === 6, "kinds covered");

  check(
    getActionById("e06.action.notify-opportunity")?.operationId ===
      "e06.op.observe-opportunity",
    "by id",
  );
  check(
    getActionByKind("orchestrate")?.id === "e06.action.orchestrate-synthesis",
    "by kind",
  );
  check(
    listActionsForOperation("e06.op.decide-pricing").length === 1,
    "actions for operation",
  );
  console.log("✓ action registry");
}

function testExecutor() {
  const notify = getActionById("e06.action.notify-opportunity");
  check(Boolean(notify), "notify action");

  const run = executeBusinessActionOrThrow(notify!, {
    input: {
      goal: "星河科技园健身中心机会信号通知",
      projectHint: "星河科技园企业健身中心",
      ready: true,
    },
    metadata: { source: "verify-e06-p2" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.effect?.effect === "opportunity-signal-notified", "effect");
  check(
    run.result.intelligenceId === "e05.intel.opportunity",
    "bound intelligence",
  );
  check(run.result.output.kind === "notify", "output kind");
  assertActionResultPass(run.result);
  check(summarizeActionResult(run.result).includes("status=result"), "summary");

  check(run.trace.eventCount >= 4, "trace events recorded");
  check(
    run.trace.events.some((e) => e.kind === "effect"),
    "effect trace event",
  );
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const action of ACTION_CATALOG) {
    const bundle = executeBusinessActionOrThrow(action, {
      input: { goal: `probe:${action.kind}`, ready: true, riskScore: 10 },
    });
    check(bundle.result.success === true, `${action.id} success`);
    check(
      bundle.result.effect?.effect === action.effect,
      `${action.id} effect`,
    );
  }

  const blocked = executeBusinessAction(notify!, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  console.log("✓ action executor → E06 operation bridge");
}

function main() {
  console.log("E06-P2 — Business Action Runtime Verification\n");

  const frozen = [...FROZEN_E06_P1, ...FROZEN_E05, ...FROZEN_E04, ...FROZEN_E03];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E06-P1", FROZEN_E06_P1, baseline);
  checkFrozen("E05", FROZEN_E05, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testRegistry();
  testExecutor();
  checkFrozen("E06-P1", FROZEN_E06_P1, baseline);
  checkFrozen("E05", FROZEN_E05, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E06 P2 business action runtime");
}

main();
