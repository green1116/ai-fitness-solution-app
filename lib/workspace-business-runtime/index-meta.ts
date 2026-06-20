import { WORKSPACE_BUSINESS_RUNTIME_P3_META } from "./domain/workspace-business-domain-meta";
import { WORKSPACE_BUSINESS_RUNTIME_P4_META } from "./orchestration/workspace-business-orchestration-meta";
import { WORKSPACE_BUSINESS_RUNTIME_P2_META } from "./context/workspace-business-context-meta";
import { WORKSPACE_BUSINESS_RUNTIME_P1_FREEZE } from "./freeze/v54-p1-meta";
import {
  WORKSPACE_BUSINESS_RUNTIME_P1_TAG,
  WORKSPACE_BUSINESS_RUNTIME_VERSION,
} from "./shared/business-constants";

/** P1 meta pointer — kept for historical verify:v54-p1 compatibility */
export const WORKSPACE_BUSINESS_RUNTIME_META = {
  version: WORKSPACE_BUSINESS_RUNTIME_VERSION,
  tag: WORKSPACE_BUSINESS_RUNTIME_P1_TAG,
  phase: "v54-workspace-business-p1",
  status: WORKSPACE_BUSINESS_RUNTIME_P1_FREEZE.status,
  dependencyTag: WORKSPACE_BUSINESS_RUNTIME_P1_FREEZE.dependencyTag,
  frozen: WORKSPACE_BUSINESS_RUNTIME_P1_FREEZE.frozen,
  nextHorizon: WORKSPACE_BUSINESS_RUNTIME_P1_FREEZE.nextHorizon,
} as const;

/** P2 meta pointer — kept for historical verify:v54-p2 compatibility */
export const WORKSPACE_BUSINESS_RUNTIME_CURRENT_META = WORKSPACE_BUSINESS_RUNTIME_P2_META;

/** P3 meta pointer — kept for historical verify:v54-p3 compatibility */
export const WORKSPACE_BUSINESS_RUNTIME_ACTIVE_META = WORKSPACE_BUSINESS_RUNTIME_P3_META;

/** P4 latest phase meta */
export const WORKSPACE_BUSINESS_RUNTIME_LATEST_META = WORKSPACE_BUSINESS_RUNTIME_P4_META;
