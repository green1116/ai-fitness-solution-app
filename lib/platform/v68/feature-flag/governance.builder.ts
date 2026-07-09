/**
 * V68 P4 — Feature flag governance report builder (read-only)
 */
import { buildConfigurationGovernanceReport } from "../configuration/governance.builder";
import { V68_CONFIGURATION_GOVERNANCE_VERSION } from "../configuration/governance.types";

import { isFeatureFlagRefsAligned } from "./alignment.catalog";
import { buildFlagDefinitionManifest } from "./flag.definition.catalog";
import { buildFlagScopeManifest } from "./flag.scope.catalog";
import { buildFlagStateManifest } from "./flag.state.catalog";
import { buildToggleContractManifest } from "./flag.toggle.contract";
import type {
  FeatureFlagGovernanceReport,
  FeatureFlagGovernanceSignals,
} from "./governance.types";
import { V68_FEATURE_FLAG_GOVERNANCE_VERSION } from "./governance.types";

const DEFAULT_SIGNALS: FeatureFlagGovernanceSignals = {
  configurationGovernanceReady: true,
  definitionCatalogComplete: true,
  stateCatalogComplete: true,
  scopeCatalogComplete: true,
  toggleContractComplete: true,
  refsAligned: true,
};

export function buildFeatureFlagGovernanceReport(input?: {
  deploymentId?: string;
  signals?: FeatureFlagGovernanceSignals;
}): FeatureFlagGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v68-feature-flag-governance-default";

  const configuration = buildConfigurationGovernanceReport({ deploymentId });
  const flagDefinitions = buildFlagDefinitionManifest();
  const flagStates = buildFlagStateManifest();
  const flagScopes = buildFlagScopeManifest();
  const toggleContract = buildToggleContractManifest();
  const refsAligned = isFeatureFlagRefsAligned();

  const signals: FeatureFlagGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    configurationGovernanceReady: configuration.governanceReady,
    definitionCatalogComplete: flagDefinitions.catalogComplete,
    stateCatalogComplete: flagStates.catalogComplete,
    scopeCatalogComplete: flagScopes.catalogComplete,
    toggleContractComplete: toggleContract.contractComplete,
    refsAligned,
    ...input?.signals,
  };

  const governanceReady =
    configuration.governanceReady &&
    flagDefinitions.catalogComplete &&
    flagStates.catalogComplete &&
    flagScopes.catalogComplete &&
    toggleContract.contractComplete &&
    refsAligned &&
    signals.configurationGovernanceReady !== false;

  return {
    version: V68_FEATURE_FLAG_GOVERNANCE_VERSION,
    reportId: `feature-flag-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    configurationGovernanceVersion: V68_CONFIGURATION_GOVERNANCE_VERSION,
    configurationGovernanceReady: configuration.governanceReady,
    flagDefinitions,
    flagStates,
    flagScopes,
    toggleContract,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `feature-flag-governance ready=${governanceReady}`,
      `flags=${flagDefinitions.flagCount}`,
      `states=${flagStates.entryCount}`,
      `scopes=${flagScopes.entryCount}`,
      `toggles=${toggleContract.ruleCount}`,
      `refsAligned=${refsAligned}`,
    ].join(" "),
  };
}

export function assertFeatureFlagGovernancePass(
  report: FeatureFlagGovernanceReport,
): asserts report is FeatureFlagGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V68 feature flag governance not ready: ${report.summary}`);
  }
}
