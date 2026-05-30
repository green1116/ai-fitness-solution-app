/**
 * V4-A5-FINAL Command Platform Baseline Freeze — verification
 */
import { COMMAND_PLATFORM_API_VERSION } from "../lib/operations/command/api/types";
import {
  buildCommandPlatformBaselineEndpoint,
  buildCommandPlatformBaselineManifest,
  buildCommandPlatformBaselineDigest,
  COMMAND_PLATFORM_BASELINE_ENDPOINT_VERSION,
} from "../lib/operations/command/platform-baseline/baseline-endpoint";
import {
  buildCommandPlatformBaselineFromStack,
  buildCommandPlatformBaselineRuntime,
  COMMAND_PLATFORM_BASELINE_VERSION,
  COMMAND_PLATFORM_CAPABILITY_CATALOG,
  buildCommandCapabilityInventory,
  classifyCommandCapabilities,
  buildCommandCapabilityDependencyGraph,
  buildCommandComplexityReport,
  buildCommandBaselineReport,
  buildCommandReleaseBaseline,
  buildCommandPlatformBaselineLineageGraph,
  buildCommandPlatformBaselineAuditRecords,
  runCommandPlatformBaselineHooks,
  collectCommandCapabilityVersionsFromRuntimes,
  V4A5_COMMAND_PLATFORM_VERSION,
} from "../lib/operations/command/platform-baseline";
import { buildCommandPlatformStack } from "../lib/operations/command/api/stack";
import { buildGatedBridgeOrchestrator } from "../lib/operations/command/gated-orchestrator";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const deploymentId = "v4-verify-command-platform-baseline";
  const runtime = buildCommandPlatformBaselineFromStack({ deploymentId });

  assert(runtime.version === COMMAND_PLATFORM_BASELINE_VERSION, "baseline version");
  assert(
    runtime.inventory.length === COMMAND_PLATFORM_CAPABILITY_CATALOG.length,
    "capability inventory complete",
  );
  assert(runtime.inventory.every((entry) => entry.present && entry.frozen), "all capabilities frozen");
  assert(runtime.classifications.length >= 5, "classifications");
  assert(
    runtime.dependencyGraph.edges.length >= COMMAND_PLATFORM_CAPABILITY_CATALOG.length - 1,
    "dependency graph",
  );
  assert(runtime.complexityReport.reportId.length > 0, "complexity report");
  assert(runtime.baselineReport.capabilityCount === 6, "baseline report");
  assert(runtime.releaseBaseline.frozen === true, "release baseline frozen");
  assert(runtime.releaseBaseline.releaseTag === "V4-A5-FINAL", "release tag");
  assert(runtime.releaseBaseline.frozenLayers.length === 6, "frozen layers");
  assert(runtime.releaseBaseline.manifestDigest.length > 0, "manifest digest");
  assert(runtime.releaseBaseline.verifyGroups.length === 6, "verify groups");
  assert(runtime.lineage.entries.length >= 6, "lineage");
  assert(runtime.audit.length > 0, "audit");
  assert(runtime.hooks.length >= 4, "hooks");
  assert(runtime.summary.text.length > 0, "summary");
  assert(runtime.status === "frozen", "baseline status frozen");

  const stack = buildCommandPlatformStack(deploymentId);
  const orchestrator = buildGatedBridgeOrchestrator({ deploymentId, stack });
  const capabilities = collectCommandCapabilityVersionsFromRuntimes();

  const baselineInput = {
    deploymentId: "unit-command-baseline",
    platformVersion: V4A5_COMMAND_PLATFORM_VERSION,
    capabilities: capabilities.map((c) =>
      c.capabilityId === "command-platform-api"
        ? { ...c, version: COMMAND_PLATFORM_API_VERSION }
        : c,
    ),
    coordination: stack.coordination,
    orchestrator,
  };

  const inventory = buildCommandCapabilityInventory(baselineInput);
  assert(inventory.length === 6, "unit inventory");
  const classifications = classifyCommandCapabilities({
    deploymentId: "unit-command-baseline",
    inventory,
  });
  assert(classifications.length >= 5, "unit classifications");
  const dependencyGraph = buildCommandCapabilityDependencyGraph({
    deploymentId: "unit-command-baseline",
  });
  assert(dependencyGraph.edges.length >= 5, "unit dependency graph");
  const complexityReport = buildCommandComplexityReport({
    deploymentId: "unit-command-baseline",
    inventory,
    classifications,
    dependencyGraph,
    coordination: stack.coordination,
    orchestrator,
  });
  assert(complexityReport.findings.length > 0, "unit complexity");
  const baselineReport = buildCommandBaselineReport({
    runtimeInput: baselineInput,
    inventory,
    classifications,
    dependencyGraph,
    complexityReport,
  });
  assert(baselineReport.summary.length > 0, "unit baseline report");
  const releaseBaseline = buildCommandReleaseBaseline({ runtimeInput: baselineInput, inventory });
  assert(releaseBaseline.frozen === true, "unit release");
  const lineage = buildCommandPlatformBaselineLineageGraph({
    deploymentId: "unit-command-baseline",
    inventory,
    classifications,
    dependencyGraph,
    complexityReport,
    baselineReport,
    releaseBaseline,
  });
  assert(lineage.entries.length >= 6, "unit lineage");
  const audit = buildCommandPlatformBaselineAuditRecords({
    baselineId: releaseBaseline.baselineId,
    deploymentId: "unit-command-baseline",
    capabilityCount: inventory.length,
    frozen: releaseBaseline.frozen,
    manifestDigest: releaseBaseline.manifestDigest,
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runCommandPlatformBaselineHooks({
    inventoryCount: inventory.length,
    frozenCount: inventory.filter((e) => e.frozen).length,
  });
  assert(hooks.some((h) => h.phase === "afterBaselineFreeze"), "unit hooks");

  const direct = buildCommandPlatformBaselineRuntime(baselineInput);
  assert(direct.registry.baselineId.length > 0, "direct registry");

  const endpointStatic = buildCommandPlatformBaselineEndpoint({ deploymentId });
  assert(endpointStatic.readonly === true, "endpoint readonly");
  assert(endpointStatic.releaseTag === "V4-A5-FINAL", "endpoint release tag");
  assert(endpointStatic.status === "frozen", "endpoint freeze status");
  assert(endpointStatic.manifest.frozenCapabilities.length === 6, "endpoint manifest");
  assert(endpointStatic.digest.manifestDigest.length > 0, "endpoint digest");
  assert(endpointStatic.capabilityLineage.length >= 6, "endpoint lineage");
  assert(endpointStatic.dependencyGraph.edges.length >= 5, "endpoint dependency");
  assert(endpointStatic.verifySummary.verifyCount === 6, "endpoint verify summary");
  assert(
    endpointStatic.endpointVersion === COMMAND_PLATFORM_BASELINE_ENDPOINT_VERSION,
    "endpoint version",
  );

  const endpointFromRuntime = buildCommandPlatformBaselineEndpoint({ deploymentId, runtime });
  assert(endpointFromRuntime.digest.manifestDigest === runtime.releaseBaseline.manifestDigest, "runtime digest match");
  assert(endpointFromRuntime.capabilityLineage.length === runtime.lineage.entries.length, "runtime lineage");

  const manifest = buildCommandPlatformBaselineManifest({ deploymentId });
  const digest = buildCommandPlatformBaselineDigest({ deploymentId, manifest });
  assert(manifest.capabilityCount === 6, "manifest builder");
  assert(digest.algorithm === "stable-hash-v1", "digest builder");

  console.log("✓ command platform baseline freeze");
  console.log("✓ command platform baseline endpoint (readonly)");
  console.log(" ", runtime.summary.text);
  console.log("COMMAND PLATFORM BASELINE FREEZE VERIFY PASS");
}

main();
