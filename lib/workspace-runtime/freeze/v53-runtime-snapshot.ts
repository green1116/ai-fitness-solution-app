import { createWorkspaceRuntimeAssemblyContext } from "../runtime-workspace-assembly-context";
import { validateAssembly } from "../runtime-workspace-assembly";
import { validateCapability } from "../runtime-capability";
import { validateEntry } from "../runtime-entry";
import { validateSurface } from "../runtime-surface";
import { validateVerification } from "../runtime-verification";
import {
  WORKSPACE_RUNTIME_FINAL_VERSION,
  WORKSPACE_RUNTIME_P8_TAG,
} from "../shared/runtime-constants";
import { V53_RUNTIME_FINAL_FREEZE, V53_RUNTIME_LAYER_STACK } from "./v53-runtime-final";

export const V53_RUNTIME_SNAPSHOT_BASE = {
  workspaceRuntimeVersion: WORKSPACE_RUNTIME_FINAL_VERSION,
  status: "frozen",
  layers: 8,
  kernelIntegrity: "locked",
} as const;

export interface V53RuntimeKernelSnapshot {
  workspaceRuntimeVersion: typeof WORKSPACE_RUNTIME_FINAL_VERSION;
  status: "frozen";
  layers: 8;
  kernelIntegrity: "locked";
  workspaceId: string;
  finalTag: typeof V53_RUNTIME_FINAL_FREEZE.tag;
  dependencyTag: typeof WORKSPACE_RUNTIME_P8_TAG;
  layerStack: typeof V53_RUNTIME_LAYER_STACK;
  contextChain: typeof V53_RUNTIME_FINAL_FREEZE.contextChain;
  capabilityLocked: boolean;
  verificationLocked: boolean;
  entryLocked: boolean;
  surfaceLocked: boolean;
  assemblyLocked: boolean;
}

export function buildV53RuntimeKernelSnapshot(workspaceId: string): V53RuntimeKernelSnapshot {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId });
  const { surfaceContext, assembly } = assemblyContext;
  const { entryContext } = surfaceContext;
  const { verificationContext } = entryContext;
  const { capabilityContext } = verificationContext;
  const { lifecycleContext } = capabilityContext;
  const { registryContext } = lifecycleContext;

  return {
    ...V53_RUNTIME_SNAPSHOT_BASE,
    workspaceId,
    finalTag: V53_RUNTIME_FINAL_FREEZE.tag,
    dependencyTag: WORKSPACE_RUNTIME_P8_TAG,
    layerStack: V53_RUNTIME_LAYER_STACK,
    contextChain: V53_RUNTIME_FINAL_FREEZE.contextChain,
    capabilityLocked:
      validateCapability(capabilityContext.capability) &&
      registryContext.workspaceId === assemblyContext.workspaceId,
    verificationLocked: validateVerification(verificationContext.verification),
    entryLocked: validateEntry(entryContext.entry),
    surfaceLocked: validateSurface(surfaceContext.surface),
    assemblyLocked: validateAssembly(assembly),
  };
}

export function assertV53RuntimeSnapshotLocked(snapshot: V53RuntimeKernelSnapshot): boolean {
  return (
    snapshot.workspaceRuntimeVersion === V53_RUNTIME_SNAPSHOT_BASE.workspaceRuntimeVersion &&
    snapshot.status === V53_RUNTIME_SNAPSHOT_BASE.status &&
    snapshot.layers === V53_RUNTIME_SNAPSHOT_BASE.layers &&
    snapshot.kernelIntegrity === V53_RUNTIME_SNAPSHOT_BASE.kernelIntegrity &&
    snapshot.finalTag === V53_RUNTIME_FINAL_FREEZE.tag &&
    snapshot.layerStack.length === 8 &&
    snapshot.contextChain.length === 8 &&
    snapshot.capabilityLocked &&
    snapshot.verificationLocked &&
    snapshot.entryLocked &&
    snapshot.surfaceLocked &&
    snapshot.assemblyLocked
  );
}

export function assertRuntimeKernelIntegrityLocked(workspaceId = "v53-final-snapshot"): boolean {
  const snapshot = buildV53RuntimeKernelSnapshot(workspaceId);
  return assertV53RuntimeSnapshotLocked(snapshot);
}
