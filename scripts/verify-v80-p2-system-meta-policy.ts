/**
 * V80 P2 — System Meta Policy Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  SYSTEM_INVARIANT_CATALOG,
  SYSTEM_META_CONSTRAINT_CATALOG,
  SYSTEM_POLICY_CATALOG,
  SYSTEM_POLICY_SCOPE_BOUNDARIES,
  V80_SYSTEM_POLICY_FREEZE_VERSION,
  V80_SYSTEM_POLICY_VERSION,
  assertSystemPolicyCatalogPass,
  buildSystemPolicyCatalog,
  computeSystemDeclarativePolicyBlock,
  formatSystemPolicyCatalogSummary,
  getSystemInvariantById,
  getSystemMetaConstraintById,
  getSystemPoliciesByKind,
  getSystemPolicyById,
  getSystemPolicyScopeBoundaryByZone,
  isSystemInvariantCatalogComplete,
  isSystemMetaConstraintCatalogComplete,
  isSystemPolicyBoundaryComplete,
  isSystemPolicyCatalogRefsAligned,
  runSystemPolicyCatalog,
} from "../lib/system/v80/system.policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-p2-system-meta-policy";
const STACK_LAYERS = ["V76", "V77", "V78", "V79"];

const REQUIRED_KINDS = [
  "boundary",
  "stack-freeze",
  "cross-layer",
  "dependency",
  "governance",
  "scope",
  "topology",
  "version",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/system/v80/system.policy.ts",
    "lib/system/v80/system.policy.catalog.ts",
    "lib/system/v80/system.invariant.catalog.ts",
    "lib/system/v80/system.constraint.catalog.ts",
    "lib/system/v80/system.policy.boundary.ts",
    "lib/system/v80/system.policy.builder.ts",
    "lib/system/v80/system.policy.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V80 system meta policy module structure");
}

function testCatalogs() {
  check(SYSTEM_POLICY_CATALOG.length === 8, "SYS-POL-001…008");
  check(SYSTEM_INVARIANT_CATALOG.length === 6, "SYS-INV-001…006");
  check(SYSTEM_META_CONSTRAINT_CATALOG.length === 4, "SYS-CON-001…004");
  check(SYSTEM_POLICY_SCOPE_BOUNDARIES.length === 3, "scope boundaries");
  check(isSystemPolicyCatalogRefsAligned(), "policy refs aligned");
  check(isSystemInvariantCatalogComplete(), "invariants complete");
  check(isSystemMetaConstraintCatalogComplete(), "constraints complete");
  check(isSystemPolicyBoundaryComplete(), "boundary complete");
  for (const kind of REQUIRED_KINDS) {
    check(getSystemPoliciesByKind(kind).length >= 1, `${kind} policy kind`);
  }
  console.log("✓ policies, invariants, constraints & boundary");
}

function testCrossLayerCoverage() {
  for (const policy of SYSTEM_POLICY_CATALOG) {
    check(policy.layerRefs.length === 4, `${policy.id} spans 4 layers`);
    for (const layer of STACK_LAYERS) {
      check(policy.layerRefs.includes(layer), `${policy.id} includes ${layer}`);
    }
    check(policy.passCondition.length > 0, `${policy.id} passCondition`);
    check(policy.invariantRef.length > 0, `${policy.id} invariantRef`);
    check(policy.constraintRef.length > 0, `${policy.id} constraintRef`);
  }
  console.log("✓ cross-layer policy coverage V76–V79");
}

function testScopeBoundary() {
  const v80 = getSystemPolicyScopeBoundaryByZone("v80-policy");
  check(v80?.appliesTo.includes("V80") === true, "V80 policy zone");
  check(v80?.appliesTo.includes("V76") !== true, "V80 zone excludes V76 authorship");

  const target = getSystemPolicyScopeBoundaryByZone("v76-v79-target");
  check(target?.appliesTo.length === 4, "V76–V79 target zone");
  check(target?.rule === "v76-v79-read-only-policy-target", "read-only target rule");

  const exclusion = getSystemPolicyScopeBoundaryByZone("exclusion");
  check(exclusion?.excludes.includes("V80") === true, "exclusion zone");

  const inv = getSystemInvariantById("SYS-INV-001");
  check(inv?.kind === "freeze", "SYS-INV-001 freeze");
  const con = getSystemMetaConstraintById("SYS-CON-002");
  check(con?.rule === "no-v76-v79-layer-mutation", "SYS-CON-002 mutation rule");

  check(
    computeSystemDeclarativePolicyBlock({ kind: "boundary", enforcement: "gate" }),
    "boundary gate block",
  );
  check(
    !computeSystemDeclarativePolicyBlock({ kind: "version", enforcement: "audit-only" }),
    "version audit no block",
  );

  console.log("✓ policy scope boundary V80 vs V76–V79");
}

function testReport() {
  const incomplete = runSystemPolicyCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { systemInventoryReady: false },
  });
  check(!incomplete.catalogReady, "incomplete inventory not ready");

  const ready = buildSystemPolicyCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_SYSTEM_POLICY_VERSION, "policy version");
  check(ready.freezeVersion === V80_SYSTEM_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.systemInventoryReady, "P1 inventory ready");
  check(ready.catalog.catalogComplete, "policies complete");
  check(ready.invariants.catalogComplete, "invariants complete");
  check(ready.constraints.catalogComplete, "constraints complete");
  check(ready.boundary.boundaryComplete, "boundary complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertSystemPolicyCatalogPass(ready);

  const pol = getSystemPolicyById("SYS-POL-003");
  check(pol?.kind === "cross-layer", "SYS-POL-003 cross-layer");

  console.log("✓ system meta policy report");
  console.log(formatSystemPolicyCatalogSummary(ready));
  console.log("\n✅ V80 P2 System Meta Policy — verify PASS");
}

function main() {
  console.log("V80 P2 System Meta Policy Verification\n");
  checkModuleStructure();
  testCatalogs();
  testCrossLayerCoverage();
  testScopeBoundary();
  testReport();
}

main();
