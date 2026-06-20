import { V53_RUNTIME_FINAL_FREEZE } from "./v53-runtime-final";
import { V53_RUNTIME_SNAPSHOT_BASE } from "./v53-runtime-snapshot";
import {
  WORKSPACE_RUNTIME_FINAL_TAG,
  WORKSPACE_RUNTIME_FINAL_VERSION,
  WORKSPACE_RUNTIME_VERSION,
} from "../shared/runtime-constants";

export const V53_RUNTIME_META = {
  tag: WORKSPACE_RUNTIME_FINAL_TAG,
  version: WORKSPACE_RUNTIME_FINAL_VERSION,
  kernelVersion: WORKSPACE_RUNTIME_VERSION,
  phase: "v53-workspace-runtime-final",
  status: V53_RUNTIME_FINAL_FREEZE.status,
  frozen: V53_RUNTIME_FINAL_FREEZE.frozen,
  layers: V53_RUNTIME_FINAL_FREEZE.layers,
  kernelIntegrity: V53_RUNTIME_FINAL_FREEZE.kernelIntegrity,
  dependencyTag: V53_RUNTIME_FINAL_FREEZE.dependencyTag,
  upstreamDependencyTag: V53_RUNTIME_FINAL_FREEZE.upstreamDependencyTag,
  snapshot: V53_RUNTIME_SNAPSHOT_BASE,
  layerStack: V53_RUNTIME_FINAL_FREEZE.layerStack,
  kernelStack: V53_RUNTIME_FINAL_FREEZE.kernelStack,
  contextChain: V53_RUNTIME_FINAL_FREEZE.contextChain,
  layerBoundaries: V53_RUNTIME_FINAL_FREEZE.layerBoundaries,
  verifyChecks: V53_RUNTIME_FINAL_FREEZE.verifyChecks,
  nextHorizon: V53_RUNTIME_FINAL_FREEZE.nextHorizon,
} as const;

export type V53RuntimeMeta = typeof V53_RUNTIME_META;

/** @deprecated Use V53_RUNTIME_META — kept for index-meta compatibility */
export const WORKSPACE_RUNTIME_META = V53_RUNTIME_META;
