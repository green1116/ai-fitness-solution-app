/**
 * V68 P3 — Configuration governance report builder (read-only)
 */
import { buildDependencyGraphReport } from "../dependency-graph/graph.builder";
import { V68_DEPENDENCY_GRAPH_VERSION } from "../dependency-graph/graph.types";

import {
  buildConfigAlignmentManifest,
  isConfigurationRefsAligned,
} from "./alignment.catalog";
import { buildConfigItemManifest } from "./config.item.catalog";
import { buildConfigSourceManifest } from "./config.source.catalog";
import { buildConfigValidityManifest } from "./config.validity.contract";
import type {
  ConfigurationGovernanceReport,
  ConfigurationGovernanceSignals,
} from "./governance.types";
import { V68_CONFIGURATION_GOVERNANCE_VERSION } from "./governance.types";

const DEFAULT_SIGNALS: ConfigurationGovernanceSignals = {
  dependencyGraphReady: true,
  itemCatalogComplete: true,
  sourceCatalogComplete: true,
  validityContractComplete: true,
  alignmentComplete: true,
};

export function buildConfigurationGovernanceReport(input?: {
  deploymentId?: string;
  signals?: ConfigurationGovernanceSignals;
}): ConfigurationGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v68-configuration-governance-default";

  const dependencyGraph = buildDependencyGraphReport({ deploymentId });
  const configItems = buildConfigItemManifest();
  const configSources = buildConfigSourceManifest();
  const configValidity = buildConfigValidityManifest();
  const configAlignment = buildConfigAlignmentManifest();
  const refsAligned = isConfigurationRefsAligned();

  const signals: ConfigurationGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    dependencyGraphReady: dependencyGraph.graphReady,
    itemCatalogComplete: configItems.catalogComplete,
    sourceCatalogComplete: configSources.catalogComplete,
    validityContractComplete: configValidity.contractComplete,
    alignmentComplete: configAlignment.manifestComplete,
    ...input?.signals,
  };

  const governanceReady =
    dependencyGraph.graphReady &&
    configItems.catalogComplete &&
    configSources.catalogComplete &&
    configValidity.contractComplete &&
    configAlignment.manifestComplete &&
    refsAligned &&
    signals.dependencyGraphReady !== false;

  return {
    version: V68_CONFIGURATION_GOVERNANCE_VERSION,
    reportId: `configuration-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    dependencyGraphVersion: V68_DEPENDENCY_GRAPH_VERSION,
    dependencyGraphReady: dependencyGraph.graphReady,
    configItems,
    configSources,
    configValidity,
    configAlignment,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `configuration-governance ready=${governanceReady}`,
      `items=${configItems.itemCount}`,
      `sources=${configSources.sourceCount}`,
      `validity=${configValidity.ruleCount}`,
      `aligned=${configAlignment.alignedCount}/${configAlignment.entryCount}`,
      `refsAligned=${refsAligned}`,
    ].join(" "),
  };
}

export function assertConfigurationGovernancePass(
  report: ConfigurationGovernanceReport,
): asserts report is ConfigurationGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V68 configuration governance not ready: ${report.summary}`);
  }
}
