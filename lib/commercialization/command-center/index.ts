/**
 * V3.7-H15 Unified Enterprise Command Center Foundation
 */

export {
  COMMAND_CENTER_CONFIG_VERSION,
  getCommandCenterConfig,
  type CommandCenterConfig,
  type CommandCenterModule,
  type CommandCenterShortcut,
  type CommandCenterSection,
  type CommandCenterVisibilityRule,
} from "./command-center.config";

export {
  COMMAND_CENTER_SUMMARY_VERSION,
  buildCommandCenterSummary,
  type CommandCenterSummary,
  type CommandCenterReadinessSummary,
} from "./command-center-summary";

export {
  COMMAND_CENTER_MANIFEST_VERSION,
  COMMAND_CENTER_VERSION,
  buildCommandCenterManifest,
  type CommandCenterManifest,
} from "./command-center-manifest";

import { memoFoundation } from "../foundation-memo";
import { COMMAND_CENTER_VERSION } from "./command-center-manifest";
import { getCommandCenterConfig, type CommandCenterConfig } from "./command-center.config";
import { buildCommandCenterSummary, type CommandCenterSummary } from "./command-center-summary";
import { buildCommandCenterManifest, type CommandCenterManifest } from "./command-center-manifest";

export const PRODUCTION_COMMAND_CENTER_VERSION = COMMAND_CENTER_VERSION;

export type ProductionCommandCenterFoundation = {
  version: typeof PRODUCTION_COMMAND_CENTER_VERSION;
  foundationId: string;
  config: CommandCenterConfig;
  summary: CommandCenterSummary;
  manifest: CommandCenterManifest;
  foundationSummary: string;
};

export function buildProductionCommandCenterFoundation(input?: {
  deploymentId?: string;
}): ProductionCommandCenterFoundation {
  const deploymentId = input?.deploymentId ?? "command-center-foundation";
  return memoFoundation("production-command-center-foundation", deploymentId, () => {
    const foundationId = `PCC-V37H15-${deploymentId.slice(0, 8)}`;
    const config = getCommandCenterConfig();
    const summary = buildCommandCenterSummary({ deploymentId });
    const manifest = buildCommandCenterManifest({ deploymentId });

    return {
      version: PRODUCTION_COMMAND_CENTER_VERSION,
      foundationId,
      config,
      summary,
      manifest,
      foundationSummary: `production-command-center id=${foundationId} readyForCommandCenter=${manifest.readyForCommandCenter} modules=${config.modules.length} shortcuts=${config.shortcuts.length} landing=${config.defaultLanding}`,
    };
  });
}
