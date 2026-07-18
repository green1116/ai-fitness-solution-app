/**
 * E07-P3 — Role Agent Marketplace verification
 * Role marketplace above E07 AI Employee Runtime
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildWorkforceFoundation,
  E07_WORKFORCE_PLATFORM_ID,
} from "../lib/workforce/e07";
import { buildEmployeeRegistryManifest } from "../lib/workforce/e07/employee/employee.registry";
import { E07_EMPLOYEE_BASE } from "../lib/workforce/e07/employee/employee.constants";
import {
  E07_MARKETPLACE_BASE,
  E07_MARKETPLACE_ID,
  E07_MARKETPLACE_VERSION,
  ROLE_CATEGORIES,
  ROLE_DEPLOY_PHASES,
  ROLE_LISTING_STATUSES,
  ROLE_TRACE_EVENT_KINDS,
} from "../lib/workforce/e07/marketplace/role.constants";
import {
  buildRoleRegistryManifest,
  getRoleByCategory,
  getRoleById,
  listDeployableRoles,
  listRolesByTag,
  listRolesForEmployee,
  ROLE_CATALOG,
} from "../lib/workforce/e07/marketplace/role.registry";
import {
  deployRoleAgent,
  deployRoleAgentOrThrow,
} from "../lib/workforce/e07/marketplace/role.deployer";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E07_P1_P2 = [
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
    "lib/workforce/e07/marketplace/role.types.ts",
    "lib/workforce/e07/marketplace/role.constants.ts",
    "lib/workforce/e07/marketplace/role.registry.ts",
    "lib/workforce/e07/marketplace/role.catalog.ts",
    "lib/workforce/e07/marketplace/role.deployer.ts",
    "lib/workforce/e07/marketplace/role.trace.ts",
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

  const employees = buildEmployeeRegistryManifest();
  check(employees.catalogComplete === true, "E07-P2 employees still complete");
  check(
    E07_EMPLOYEE_BASE === "enterprise-e07-p1-digital-workforce-foundation-v1",
    "E07-P2 base constant",
  );
  check(
    E07_MARKETPLACE_BASE === "enterprise-e07-p2-ai-employee-runtime-v1",
    "E07-P3 base constant",
  );
  console.log("✓ upstream + E07-P1/P2 unmodified / bases intact");
}

function testRegistryAndCatalog() {
  check(ROLE_CATEGORIES.length === 3, "role categories");
  check(ROLE_LISTING_STATUSES.length === 3, "listing statuses");
  check(ROLE_DEPLOY_PHASES.length === 4, "deploy phases");
  check(ROLE_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(ROLE_CATALOG.length === 3, "roles");

  const manifest = buildRoleRegistryManifest();
  check(manifest.catalogComplete === true, "role catalog complete");
  check(manifest.marketplaceId === E07_MARKETPLACE_ID, "marketplace id");
  check(manifest.version === E07_MARKETPLACE_VERSION, "version");
  check(manifest.base === E07_MARKETPLACE_BASE, "base e07-p2");
  check(manifest.categories.length === 3, "categories covered");

  check(
    getRoleByCategory("commercial")?.id === "e07.role.bid-agent",
    "by category",
  );
  check(
    getRoleById("e07.role.risk-agent")?.employeeId ===
      "e07.employee.risk-officer",
    "by id",
  );
  check(listDeployableRoles().length === 3, "all deployable");
  check(listRolesByTag("tender").length === 1, "by tag");
  check(
    listRolesForEmployee("e07.employee.delivery-manager").length === 1,
    "roles for employee",
  );
  console.log("✓ role registry + catalog");
}

function testDeployer() {
  const bid = getRoleById("e07.role.bid-agent");
  check(Boolean(bid), "bid role");

  const run = deployRoleAgentOrThrow(bid!, {
    input: {
      goal: "星河科技园健身中心角色代理市场部署",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e07-p3" },
  });

  check(run.result.success === true, "deploy success");
  check(run.result.status === "result", "status result");
  check(run.result.employee?.success === true, "employee success");
  check(run.result.employee?.completedTasks === 3, "employee tasks");
  check(run.result.output.category === "commercial", "output category");
  check(run.result.output.title === "AI Bid Agent", "output title");

  check(run.trace.eventCount >= 5, "trace events recorded");
  for (const kind of ["select", "deploy", "activate", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const role of ROLE_CATALOG) {
    const bundle = deployRoleAgentOrThrow(role, {
      input: { goal: `probe:${role.category}`, ready: true, riskScore: 10 },
    });
    check(bundle.result.success === true, `${role.id} success`);
    check(
      bundle.result.employeeId === role.employeeId,
      `${role.id} employee binding`,
    );
  }

  // Unsafe input blocks through employee → worker → E06 policy
  const blocked = deployRoleAgent(bid!, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  // Non-deployable listing fails
  const retired = deployRoleAgent({
    ...bid!,
    listingStatus: "retired",
  });
  check(retired.result.success === false, "retired not success");
  check(retired.result.status === "failed", "retired failed");
  check(
    (retired.result.errorMessage ?? "").includes("not deployable"),
    "retired message",
  );

  // Missing employee rejected at assert
  let threw = false;
  try {
    deployRoleAgent({
      ...bid!,
      employeeId: "e07.employee.missing",
    });
  } catch (error) {
    threw =
      error instanceof Error && error.message.includes("missing E07 employee");
  }
  check(threw, "broken role definition rejected");

  console.log("✓ role deployer → E07 employee bridge");
}

function main() {
  console.log("E07-P3 — Role Agent Marketplace Verification\n");

  const frozen = [...FROZEN_E07_P1_P2, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E07-P1/P2", FROZEN_E07_P1_P2, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndCatalog();
  testDeployer();
  checkFrozen("E07-P1/P2", FROZEN_E07_P1_P2, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E07 P3 role agent marketplace");
}

main();
