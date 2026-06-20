import { WORKSPACE_RUNTIME_P8_FREEZE } from "./freeze/v53-p8-meta";
import { WORKSPACE_RUNTIME_P8_TAG, WORKSPACE_RUNTIME_VERSION } from "./shared/runtime-constants";

export const WORKSPACE_RUNTIME_META = {
  version: WORKSPACE_RUNTIME_VERSION,
  tag: WORKSPACE_RUNTIME_P8_TAG,
  phase: "v53-workspace-runtime-p8",
  status: WORKSPACE_RUNTIME_P8_FREEZE.status,
  dependencyTag: WORKSPACE_RUNTIME_P8_FREEZE.dependencyTag,
  frozen: WORKSPACE_RUNTIME_P8_FREEZE.frozen,
  nextHorizon: WORKSPACE_RUNTIME_P8_FREEZE.nextHorizon,
} as const;
