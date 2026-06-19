import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { buildOwnerContext } from "@/lib/saas-rbac";
import { PRODUCT_CODES } from "../shared/product-types";
import { SAAS_PRODUCT_FINAL_TAG, SAAS_PRODUCT_P8_TAG } from "../freeze/v49-final-meta";
import { validateSaasProductP1 } from "./validate-saas-product-p1";
import { validateSaasProductP2ModuleExports } from "./validate-saas-product-p2";
import { validateSaasProductP3Runtime } from "./validate-saas-product-p3";
import { validateSaasProductP4Runtime } from "./validate-saas-product-p4";
import { validateSaasProductP5Runtime } from "./validate-saas-product-p5";
import { validateSaasProductP6Runtime } from "./validate-saas-product-p6";
import { validateSaasProductP7Runtime } from "./validate-saas-product-p7";
import { resolveProduct, listProducts } from "../registry/product-registry";
import { resolveProductContext } from "../context/resolve-product-context";
import {
  clearWorkflowEvents,
  createQuoteWorkflow,
  transitionWorkflow,
} from "../workflow-runtime/quote-workflow-runtime";
import { clearWorkflowP5Events } from "../workflow-runtime/workflow-events-p5";
import {
  clearWorkflowRepository,
} from "../workflow-runtime/workflow-repository";
import {
  createApprovalWorkflow,
  createDeliveryWorkflow,
  createReleaseWorkflow,
  transitionBusinessWorkflow,
} from "../workflow-runtime/business-process-runtime";
import {
  clearWorkspaceProductRepository,
  createProductWorkspace,
} from "../workspace-runtime/workspace-product-runtime";
import { buildPortalView, resolvePortalContext } from "../portal/portal-runtime";
import { activateProduct, buildProductOpsRuntime } from "../ops/ops-runtime";

const PRODUCT_ROOT = join(process.cwd(), "lib", "saas-product");

const FORBIDDEN_V47_RUNTIME_PATTERN =
  /(?:commercial-products\/(?:access-layer\/quote\/quote-service|orchestration\/|approval\/|release\/|workspace\/))/;

const MUTATION_LEAK_PATTERNS = [
  /\btransitionWorkflow\s*\(/,
  /\btransitionBusinessWorkflow\s*\(/,
  /\bcreateQuoteWorkflow\s*\(/,
  /\bcreateApprovalWorkflow\s*\(/,
  /\bexecuteCommercialQuote\s*\(/,
];

const PHASE_LAYER_DIRS: Record<string, string[]> = {
  P1: ["registry", "mapping"],
  P2: ["context"],
  P3: ["workspace-runtime"],
  P4: ["workflow-runtime"],
  P5: ["workflow-runtime"],
  P6: ["portal"],
  P7: ["ops"],
};

export interface SaasProductP8AuditResult {
  valid: boolean;
  summary: string;
  phaseValidations: Record<string, boolean>;
  crossLayerClean: boolean;
  v47BoundaryClean: boolean;
  mutationLeakFree: boolean;
  runtimeContractsFrozen: boolean;
  typeSystemLocked: boolean;
  commercialReadiness: boolean;
}

function walkTsFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "freeze" || entry.name === "validation") continue;
      walkTsFiles(fullPath, files);
      continue;
    }
    if (entry.name.endsWith(".ts")) files.push(fullPath);
  }
  return files;
}

function relativeProductPath(fullPath: string): string {
  return fullPath.replace(/\\/g, "/").split("/lib/saas-product/")[1] ?? fullPath;
}

function detectLayer(filePath: string): string | undefined {
  const rel = relativeProductPath(filePath);
  for (const [phase, dirs] of Object.entries(PHASE_LAYER_DIRS)) {
    if (dirs.some((dir) => rel.startsWith(dir))) return phase;
  }
  return undefined;
}

function scanV47Boundary(): string[] {
  return walkTsFiles(PRODUCT_ROOT).filter((file) =>
    FORBIDDEN_V47_RUNTIME_PATTERN.test(readFileSync(file, "utf8")),
  );
}

function scanMutationLeakage(): string[] {
  const violations: string[] = [];
  for (const phase of ["P6", "P7"] as const) {
    const dirs = PHASE_LAYER_DIRS[phase];
    for (const file of walkTsFiles(PRODUCT_ROOT)) {
      const rel = relativeProductPath(file);
      if (!dirs.some((dir) => rel.startsWith(dir))) continue;
      const content = readFileSync(file, "utf8");
      for (const pattern of MUTATION_LEAK_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${rel}: ${pattern.source}`);
        }
      }
    }
  }
  return violations;
}

function auditCrossLayerDependencies(): string[] {
  const violations: string[] = [];
  const layerRank: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5, P6: 6, P7: 7 };

  for (const file of walkTsFiles(PRODUCT_ROOT)) {
    const fromLayer = detectLayer(file);
    if (!fromLayer || fromLayer === "P1") continue;

    const content = readFileSync(file, "utf8");
    const rel = relativeProductPath(file);

    if (fromLayer === "P7" && /from ["']@\/lib\/commercial-products/.test(content)) {
      violations.push(`${rel}: P7 → V47 direct import`);
    }

    if (fromLayer === "P6" && /from ["']@\/lib\/commercial-products/.test(content)) {
      violations.push(`${rel}: P6 → V47 direct import`);
    }

    if ((fromLayer === "P6" || fromLayer === "P7") && /from ["'].*\/registry\//.test(content)) {
      violations.push(`${rel}: ${fromLayer} → P1 registry skip`);
    }

    if (fromLayer === "P7" && /from ["'].*\/context\/resolve-product-context/.test(content) && !rel.startsWith("ops/ops-read-adapter")) {
      // P7 should aggregate via portal/ops adapters, not bind context directly
      if (/resolveProductContext\s*\(/.test(content)) {
        violations.push(`${rel}: P7 bypasses portal adapter for context`);
      }
    }

    const importMatches = content.matchAll(/from ["'](\.{1,2}\/[^"']+)["']/g);
    for (const match of importMatches) {
      const importPath = match[1];
      if (!importPath.includes("registry/") && !importPath.includes("mapping/")) continue;
      const toLayer = importPath.includes("registry/") || importPath.includes("mapping/") ? "P1" : undefined;
      if (toLayer && layerRank[fromLayer] - layerRank[toLayer] > 3 && fromLayer !== "P4" && fromLayer !== "P5") {
        violations.push(`${rel}: ${fromLayer} → ${toLayer} deep skip via ${importPath}`);
      }
    }
  }

  return violations;
}

function auditRuntimeContracts(): boolean {
  return (
    typeof resolveProduct === "function" &&
    typeof resolveProductContext === "function" &&
    typeof createProductWorkspace === "function" &&
    typeof createQuoteWorkflow === "function" &&
    typeof transitionBusinessWorkflow === "function" &&
    typeof buildPortalView === "function" &&
    typeof buildProductOpsRuntime === "function"
  );
}

function auditTypeSystemLock(
  productContext: ReturnType<typeof resolveProductContext>,
  workspaceProduct: ReturnType<typeof createProductWorkspace>,
  workflow: ReturnType<typeof createQuoteWorkflow>,
  portalView: ReturnType<typeof buildPortalView>,
  opsRuntime: ReturnType<typeof buildProductOpsRuntime>,
): boolean {
  const pc = productContext;
  const ws = workspaceProduct;
  const wf = workflow;
  const pv = portalView;
  const ops = opsRuntime.dashboard;

  return (
    Boolean(pc.tenantId && pc.productCode && pc.productDefinition && pc.permissions) &&
    Boolean(ws.workspaceProductId && ws.productContextSnapshot && ws.status) &&
    Boolean(wf.workflowId && wf.workflowType && wf.currentState && Array.isArray(wf.history)) &&
    Boolean(pv.productView && pv.workspaceView && pv.workflowView && pv.capabilities && pv.routingMap) &&
    Boolean(ops.health && ops.workflowMetrics && ops.workspaceMetrics && ops.lifecycleSummary && ops.portalSummary)
  );
}

function buildTenantContext(base: TenantContext, overrides: Partial<TenantContext>): TenantContext {
  return { ...base, ...overrides };
}

function runCommercialReadinessCheck(): boolean {
  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  const owner = buildOwnerContext();
  const skus = listProducts().map((item) => item.productCode);
  const multiSkuOk = PRODUCT_CODES.every((code) => skus.includes(code));

  const tenantA = buildTenantContext(owner, { tenantId: "p8-tenant-a", workspaceId: "p8-workspace-a" });
  const tenantB = buildTenantContext(owner, {
    tenantId: "p8-tenant-b",
    workspaceId: "p8-workspace-b",
    userId: "p8-user-b",
  });

  const ctxA = resolveProductContext(tenantA, "kickstart-package");
  const ctxB = resolveProductContext(tenantB, "delivery-intelligence-package");
  const wsA = activateProduct(createProductWorkspace({ context: ctxA, status: "draft" }).workspaceProductId);
  const wsB = activateProduct(createProductWorkspace({ context: ctxB, status: "draft" }).workspaceProductId);

  const multiTenantOk = wsA.tenantId !== wsB.tenantId;
  const multiWorkspaceOk = wsA.workspaceId !== wsB.workspaceId;

  const actor = tenantA.userId;
  const quote = createQuoteWorkflow(wsA.workspaceProductId, actor);
  transitionWorkflow({ workflowId: quote.workflowId, toState: "estimating", actor });
  transitionWorkflow({ workflowId: quote.workflowId, toState: "review", actor });
  const approvedQuote = transitionWorkflow({
    workflowId: quote.workflowId,
    toState: "approved",
    actor,
  });

  const approval = createApprovalWorkflow(wsA.workspaceProductId, actor);
  transitionBusinessWorkflow({ workflowId: approval.workflowId, toState: "reviewing", actor });
  const approvedApproval = transitionBusinessWorkflow({
    workflowId: approval.workflowId,
    toState: "approved",
    actor,
  });

  const delivery = createDeliveryWorkflow(wsA.workspaceProductId, actor);
  transitionBusinessWorkflow({ workflowId: delivery.workflowId, toState: "in_progress", actor });
  const completedDelivery = transitionBusinessWorkflow({
    workflowId: delivery.workflowId,
    toState: "completed",
    actor,
  });

  const release = createReleaseWorkflow(wsA.workspaceProductId, actor);
  transitionBusinessWorkflow({ workflowId: release.workflowId, toState: "ready", actor });
  const released = transitionBusinessWorkflow({
    workflowId: release.workflowId,
    toState: "released",
    actor,
  });

  const fullFlowOk =
    approvedQuote.currentState === "approved" &&
    approvedApproval.currentState === "approved" &&
    completedDelivery.currentState === "completed" &&
    released.currentState === "released";

  const portalContext = resolvePortalContext({ tenantContext: tenantA, workspaceProductId: wsA.workspaceProductId });
  const portalView = buildPortalView(portalContext);
  const portalOk = portalView.workflowView.byType.RELEASE?.currentState === "released";

  const opsRuntime = buildProductOpsRuntime({ tenantContext: tenantA, workspaceProductId: wsA.workspaceProductId });
  const opsOk = opsRuntime.dashboard.workflowMetrics.releaseCount === 1;

  const registryOk = Boolean(resolveProduct("delivery-intelligence-package").productCode);

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  return multiSkuOk && multiTenantOk && multiWorkspaceOk && fullFlowOk && portalOk && opsOk && registryOk;
}

export function validateSaasProductP8Freeze(): SaasProductP8AuditResult {
  const phaseValidations = {
    P1: validateSaasProductP1().valid,
    P2: validateSaasProductP2ModuleExports().valid,
    P3: validateSaasProductP3Runtime().valid,
    P4: validateSaasProductP4Runtime().valid,
    P5: validateSaasProductP5Runtime().valid,
    P6: validateSaasProductP6Runtime().valid,
    P7: validateSaasProductP7Runtime().valid,
  };

  const v47Violations = scanV47Boundary();
  const mutationViolations = scanMutationLeakage();
  const crossLayerViolations = auditCrossLayerDependencies();
  const runtimeContractsFrozen = auditRuntimeContracts();

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  const tenantContext = buildOwnerContext();
  const productContext = resolveProductContext(tenantContext, "kickstart-package");
  const workspaceProduct = activateProduct(
    createProductWorkspace({ context: productContext, status: "draft" }).workspaceProductId,
  );
  const quote = createQuoteWorkflow(workspaceProduct.workspaceProductId, tenantContext.userId);
  const portalContext = resolvePortalContext({
    tenantContext,
    workspaceProductId: workspaceProduct.workspaceProductId,
  });
  const portalView = buildPortalView(portalContext);
  const opsRuntime = buildProductOpsRuntime({
    tenantContext,
    workspaceProductId: workspaceProduct.workspaceProductId,
  });
  const typeSystemLocked = auditTypeSystemLock(productContext, workspaceProduct, quote, portalView, opsRuntime);
  const commercialReadiness = runCommercialReadinessCheck();

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  const crossLayerClean = crossLayerViolations.length === 0;
  const v47BoundaryClean = v47Violations.length === 0;
  const mutationLeakFree = mutationViolations.length === 0;
  const allPhasesValid = Object.values(phaseValidations).every(Boolean);

  const valid =
    allPhasesValid &&
    crossLayerClean &&
    v47BoundaryClean &&
    mutationLeakFree &&
    runtimeContractsFrozen &&
    typeSystemLocked &&
    commercialReadiness;

  return {
    valid,
    summary: [
      `p8Tag=${SAAS_PRODUCT_P8_TAG}`,
      `finalTag=${SAAS_PRODUCT_FINAL_TAG}`,
      `allPhases=${allPhasesValid}`,
      `crossLayerClean=${crossLayerClean}`,
      `v47BoundaryClean=${v47BoundaryClean}`,
      `mutationLeakFree=${mutationLeakFree}`,
      `runtimeContractsFrozen=${runtimeContractsFrozen}`,
      `typeSystemLocked=${typeSystemLocked}`,
      `commercialReadiness=${commercialReadiness}`,
      `valid=${valid}`,
    ].join(" "),
    phaseValidations,
    crossLayerClean,
    v47BoundaryClean,
    mutationLeakFree,
    runtimeContractsFrozen,
    typeSystemLocked,
    commercialReadiness,
  };
}

export const validateSaasProductP8Runtime = validateSaasProductP8Freeze;
