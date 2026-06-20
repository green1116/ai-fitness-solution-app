import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertRuntimeKernelIntegrityLocked,
  createWorkspaceRuntimeAssemblyContext,
} from "@/lib/workspace-runtime";
import {
  assertWorkspaceBusinessBridgeView,
  createWorkspaceBusinessBridge,
  describeWorkspaceBusinessBridge,
  resolveBusinessReadiness,
} from "../bridge/workspace-runtime-bridge";
import type { BusinessP1Validation } from "../bridge/workspace-runtime-bridge-types";
import { WORKSPACE_BUSINESS_RUNTIME_P1_TAG } from "../shared/business-constants";

const BUSINESS_ROOT = join(process.cwd(), "lib", "workspace-business-runtime");
const BRIDGE_ROOT = join(BUSINESS_ROOT, "bridge");

export async function validateBusinessBridgeP1(): Promise<BusinessP1Validation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p1-bridge-validate" });
  const bridgeView = createWorkspaceBusinessBridge(assemblyContext);

  const valid =
    existsSync(join(BRIDGE_ROOT, "workspace-runtime-bridge.ts")) &&
    existsSync(join(BRIDGE_ROOT, "workspace-runtime-bridge-types.ts")) &&
    assertRuntimeKernelIntegrityLocked() &&
    assertWorkspaceBusinessBridgeView(bridgeView) &&
    bridgeView.readiness.readiness === "BLOCKED" &&
    assertBridgeConsumesAssemblyOnly() &&
    assertBridgeNoKernelMutation() &&
    assertBridgeFoundationOnlyScope();

  return {
    valid,
    summary: [
      `p1Tag=${WORKSPACE_BUSINESS_RUNTIME_P1_TAG}`,
      describeWorkspaceBusinessBridge(bridgeView),
      `readiness=${bridgeView.readiness.readiness}`,
      `kernelIntegrity=${assertRuntimeKernelIntegrityLocked()}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertBridgeContract(): boolean {
  const bridgePath = join(BRIDGE_ROOT, "workspace-runtime-bridge.ts");
  const content = readFileSync(bridgePath, "utf8");
  return (
    content.includes("createWorkspaceBusinessBridge") &&
    content.includes("resolveBusinessReadiness") &&
    content.includes("resolveBusinessSurfaceViews") &&
    content.includes("resolveBusinessEntryViews")
  );
}

export function assertBridgeTypesContract(): boolean {
  const typesPath = join(BRIDGE_ROOT, "workspace-runtime-bridge-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("BusinessReadiness") &&
    content.includes("BusinessReadinessView") &&
    content.includes("BusinessSurfaceView") &&
    content.includes("BusinessEntryView") &&
    content.includes("WorkspaceBusinessBridgeView")
  );
}

export function assertBridgeConsumesAssemblyOnly(): boolean {
  const bridgeFiles = [
    join(BRIDGE_ROOT, "workspace-runtime-bridge.ts"),
    join(BRIDGE_ROOT, "workspace-runtime-bridge-types.ts"),
  ];
  const forbiddenImports = [
    /runtime-lifecycle/,
    /runtime-registry/,
    /runtime-entry/,
    /runtime-surface/,
    /runtime-capability/,
    /runtime-verification/,
    /runtime-workspace-assembly-context/,
    /saas-product-persistence/,
    /saas-product-api/,
    /saas-product-portal/,
    /@prisma\/client/,
  ];
  const allowedRuntimeImport = /@\/lib\/workspace-runtime/;

  return bridgeFiles.every((file) => {
    const content = readFileSync(file, "utf8");
    if (forbiddenImports.some((pattern) => pattern.test(content))) {
      return false;
    }
    if (file.endsWith("workspace-runtime-bridge.ts")) {
      return allowedRuntimeImport.test(content);
    }
    return !content.includes("@/lib/workspace-runtime");
  });
}

export function assertBridgeNoKernelMutation(): boolean {
  const bridgePath = join(BRIDGE_ROOT, "workspace-runtime-bridge.ts");
  const content = readFileSync(bridgePath, "utf8");
  const forbidden = [
    /mountRuntime/,
    /unmountRuntime/,
    /registerCapability/,
    /registerEntry/,
    /registerSurface/,
    /registerAssembly/,
    /registerVerification/,
    /syncCapability/,
    /syncEntry/,
    /syncSurface/,
    /syncAssembly/,
    /attachRuntime/,
    /createWorkspaceRuntime(?!AssemblyContext)/,
    /transitionRuntime/,
  ];
  return !forbidden.some((pattern) => pattern.test(content));
}

export function assertBridgeFoundationOnlyScope(): boolean {
  const files = [
    join(BRIDGE_ROOT, "workspace-runtime-bridge.ts"),
    join(BRIDGE_ROOT, "workspace-runtime-bridge-types.ts"),
  ];
  const forbidden = [
    /createQuote/,
    /calculateQuote/,
    /handleCreateQuote/,
    /workflow/,
    /orchestrat/i,
    /BusinessContext/,
    /domains\//,
  ];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertMountedBusinessBridgeReadiness(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p1-bridge-mounted" });
  const mountedAssembly = {
    ...assemblyContext,
    assembly: {
      ...assemblyContext.assembly,
      eligible: true,
      assembled: true,
      aggregateStatus: "assembled" as const,
      lifecycleStatus: "mounted" as const,
    },
  };
  return resolveBusinessReadiness(mountedAssembly) === "READY";
}
