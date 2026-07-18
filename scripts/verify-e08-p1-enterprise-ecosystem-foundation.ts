/**
 * E08-P1 — Enterprise Ecosystem Foundation verification
 * Ecosystem abstraction above E07 Digital Workforce Platform
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildWorkforceFoundation } from "../lib/workforce/e07/core/workforce.lifecycle";
import {
  E07_WORKFORCE_PLATFORM_ID,
  E07_WORKFORCE_VERSION,
} from "../lib/workforce/e07/core/workforce.constants";
import { E07_WORKFORCE_PLATFORM_FREEZE_VERSION } from "../lib/workforce/e07/signoff/signoff.types";
import {
  assertEcosystemFoundationPass,
  buildEcosystemFoundation,
  buildRelationshipRegistryManifest,
  canAdvanceEcosystemLifecycle,
  createEcosystemExecutionContext,
  E08_ECOSYSTEM_BASE,
  E08_ECOSYSTEM_PLATFORM_ID,
  E08_ECOSYSTEM_VERSION,
  ECOSYSTEM_DOMAINS,
  ECOSYSTEM_LIFECYCLE_STAGES,
  ECOSYSTEM_PARTNER_CATALOG,
  executeEcosystemPartnerOrThrow,
  getPartnerByDomain,
  getPartnerById,
  isPartnerDependencyGraphValid,
  listExecutablePartners,
  RELATIONSHIP_CATALOG,
  RELATIONSHIP_KINDS,
} from "../lib/ecosystem/e08";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E07 = [
  "lib/workforce/e07/core/workforce.types.ts",
  "lib/workforce/e07/core/workforce.constants.ts",
  "lib/workforce/e07/core/workforce.registry.ts",
  "lib/workforce/e07/core/workforce.lifecycle.ts",
  "lib/workforce/e07/runtime/workforce.context.ts",
  "lib/workforce/e07/runtime/workforce.executor.ts",
  "lib/workforce/e07/skill/skill.registry.ts",
  "lib/workforce/e07/index.ts",
  "lib/workforce/e07/signoff/signoff.types.ts",
] as const;

const FROZEN_UPSTREAM = [
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/autonomous/e06/index.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
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
    "lib/ecosystem/e08/core/ecosystem.types.ts",
    "lib/ecosystem/e08/core/ecosystem.constants.ts",
    "lib/ecosystem/e08/core/ecosystem.lifecycle.ts",
    "lib/ecosystem/e08/core/ecosystem.registry.ts",
    "lib/ecosystem/e08/runtime/ecosystem.context.ts",
    "lib/ecosystem/e08/runtime/ecosystem.executor.ts",
    "lib/ecosystem/e08/relationship/relationship.types.ts",
    "lib/ecosystem/e08/relationship/relationship.registry.ts",
    "lib/ecosystem/e08/index.ts",
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
  check(foundation.ready === true, "E07 foundation still ready");
  check(
    foundation.platformId === E07_WORKFORCE_PLATFORM_ID,
    "E07 platform id intact",
  );
  check(foundation.version === E07_WORKFORCE_VERSION, "E07 version intact");
  check(
    E07_WORKFORCE_PLATFORM_FREEZE_VERSION === "e07-workforce-platform-freeze-1",
    "E07 platform freeze version present",
  );
  check(
    E08_ECOSYSTEM_BASE ===
      "enterprise-e07-digital-workforce-platform-freeze-v1",
    "E08 base constant",
  );
  console.log("✓ E03 + E04 + E05 + E06 + E07 unmodified / bases intact");
}

function testFoundationAndRelationships() {
  check(ECOSYSTEM_DOMAINS.length === 6, "ecosystem domains");
  check(ECOSYSTEM_LIFECYCLE_STAGES.length === 5, "lifecycle stages");
  check(
    canAdvanceEcosystemLifecycle("declared", "registered"),
    "declared→registered",
  );
  check(
    !canAdvanceEcosystemLifecycle("declared", "completed"),
    "skip blocked",
  );

  check(ECOSYSTEM_PARTNER_CATALOG.length === 6, "partners");
  check(isPartnerDependencyGraphValid(), "dependency graph");
  check(RELATIONSHIP_CATALOG.length === 6, "relationships");
  check(RELATIONSHIP_KINDS.length === 6, "relationship kinds");

  const relationships = buildRelationshipRegistryManifest();
  check(relationships.catalogComplete === true, "relationship catalog complete");

  const foundation = buildEcosystemFoundation();
  check(foundation.ready === true, "foundation ready");
  check(foundation.platformId === E08_ECOSYSTEM_PLATFORM_ID, "platform id");
  check(foundation.base === E08_ECOSYSTEM_BASE, "base e07 freeze");
  check(foundation.version === E08_ECOSYSTEM_VERSION, "version");
  check(foundation.registry.catalogComplete === true, "registry complete");
  check(foundation.lifecycle.complete === true, "lifecycle complete");
  assertEcosystemFoundationPass(foundation);

  check(
    getPartnerByDomain("supplier")?.id === "e08.partner.supplier",
    "by domain",
  );
  check(listExecutablePartners().length === 5, "executable partners");
  console.log("✓ foundation + relationships");
  console.log(foundation.summary);
}

function testExecutorBridge() {
  const supplier = getPartnerById("e08.partner.supplier");
  check(Boolean(supplier), "supplier partner");

  const context = createEcosystemExecutionContext({
    partnerId: supplier!.id,
    workerId: supplier!.workerId,
    relationshipId: "e08.rel.supply",
    input: {
      goal: "星河科技园健身中心生态供应观测",
      projectHint: "星河科技园企业健身中心",
      ready: true,
    },
    metadata: { source: "verify-e08-p1" },
  });

  const run = executeEcosystemPartnerOrThrow(supplier!, context);
  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(
    run.result.workforce.result.success === true,
    "E07 workforce success",
  );
  check(run.result.workerId === "e07.worker.observer", "bound worker");
  check(run.result.output.domain === "supplier", "domain output");
  check(run.result.output.relationshipKind === "supply", "relationship kind");

  for (const partner of listExecutablePartners()) {
    const ctx = createEcosystemExecutionContext({
      partnerId: partner.id,
      workerId: partner.workerId,
      relationshipId: partner.relationshipIds[0],
      input: { goal: `probe:${partner.domain}`, ready: true, riskScore: 10 },
    });
    const bundle = executeEcosystemPartnerOrThrow(partner, ctx);
    check(bundle.result.success === true, `${partner.id} success`);
  }

  const hub = getPartnerById("e08.partner.hub");
  check(Boolean(hub), "hub partner");
  const hubRun = executeEcosystemPartnerOrThrow(
    hub!,
    createEcosystemExecutionContext({
      partnerId: hub!.id,
      workerId: hub!.workerId,
      relationshipId: "e08.rel.coordinate",
      input: { goal: "hub coordination probe", ready: true },
    }),
  );
  check(hubRun.result.success === true, "hub success");

  let threw = false;
  try {
    executeEcosystemPartnerOrThrow(
      supplier!,
      createEcosystemExecutionContext({
        partnerId: supplier!.id,
        workerId: supplier!.workerId,
        relationshipId: "e08.rel.coordinate",
        input: { goal: "bad relationship", ready: true },
      }),
    );
  } catch (error) {
    threw = error instanceof Error && error.message.includes("not owned");
  }
  check(threw, "foreign relationship rejected");

  console.log("✓ ecosystem executor → E07 digital worker bridge");
}

function main() {
  console.log("E08-P1 — Enterprise Ecosystem Foundation Verification\n");

  const frozen = [...FROZEN_E07, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E07", FROZEN_E07, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testFoundationAndRelationships();
  testExecutorBridge();
  checkFrozen("E07", FROZEN_E07, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E08 P1 enterprise ecosystem foundation");
}

main();
