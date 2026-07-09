/**
 * V80 GTM P2 — First revenue execution builder (read-only GTM P1 consumer)
 */
import { buildCustomerActivation } from "./activation.builder";
import { V80_GTM_ACTIVATION_VERSION } from "./activation.types";

import { FIRST_DEAL_EXECUTION_FLOW, isFirstDealExecutionFlowComplete } from "./execution.deal-flow.spec";
import { FIRST_DEAL_OFFER_PACK, isFirstDealOfferPackComplete } from "./execution.offer-pack.spec";
import { isSalesExecutionScriptComplete, SALES_EXECUTION_SCRIPT } from "./execution.sales-script.spec";
import { isRevenueCaptureMechanismComplete, REVENUE_CAPTURE_MECHANISM } from "./execution.revenue-capture.spec";
import type { ExecutionManifest, FirstRevenueExecutionReport } from "./execution.types";
import { V80_GTM_EXECUTION_FREEZE_VERSION, V80_GTM_EXECUTION_VERSION } from "./execution.types";

export function buildExecutionManifest(input: { activationReady: boolean }): ExecutionManifest {
  const dealComplete = isFirstDealExecutionFlowComplete();
  const offerComplete = isFirstDealOfferPackComplete();
  const scriptComplete = isSalesExecutionScriptComplete();
  const captureComplete = isRevenueCaptureMechanismComplete();

  const executionComplete =
    input.activationReady && dealComplete && offerComplete && scriptComplete && captureComplete;

  return {
    version: V80_GTM_EXECUTION_VERSION,
    activationVersion: V80_GTM_ACTIVATION_VERSION,
    dealSteps: FIRST_DEAL_EXECUTION_FLOW.length,
    offerPackItems: FIRST_DEAL_OFFER_PACK.length,
    salesScriptBeats: SALES_EXECUTION_SCRIPT.length,
    revenueCapturePoints: REVENUE_CAPTURE_MECHANISM.length,
    executionComplete,
    summary: `execution complete=${executionComplete} steps=${FIRST_DEAL_EXECUTION_FLOW.length}`,
  };
}

export function buildFirstRevenueExecution(input?: { deploymentId?: string }): FirstRevenueExecutionReport {
  const deploymentId = input?.deploymentId ?? "v80-gtm-execution";
  const customerActivation = buildCustomerActivation({ deploymentId });
  const manifest = buildExecutionManifest({ activationReady: customerActivation.activationReady });

  const executionReady = customerActivation.activationReady && manifest.executionComplete;

  return {
    version: V80_GTM_EXECUTION_VERSION,
    freezeVersion: V80_GTM_EXECUTION_FREEZE_VERSION,
    reportId: `gtm-execution-${deploymentId}`,
    activationReady: customerActivation.activationReady,
    manifest,
    dealExecutionFlow: FIRST_DEAL_EXECUTION_FLOW,
    offerPack: FIRST_DEAL_OFFER_PACK,
    salesScript: SALES_EXECUTION_SCRIPT,
    revenueCapture: REVENUE_CAPTURE_MECHANISM,
    customerActivation,
    executionReady,
    readinessScore: executionReady ? 100 : 0,
    summary: `execution ready=${executionReady} activation=${customerActivation.activationReady}`,
  };
}

export function assertFirstRevenueExecutionPass(
  report: FirstRevenueExecutionReport,
): asserts report is FirstRevenueExecutionReport & { executionReady: true } {
  if (!report.executionReady) {
    throw new Error(`V80 GTM execution not ready: ${report.summary}`);
  }
}

export function formatExecutionSummary(report: FirstRevenueExecutionReport): string {
  return [
    `V80 GTM P2 First Revenue Execution`,
    `  version: ${report.version}`,
    `  executionReady: ${report.executionReady}`,
    `  dealFlow: ${report.dealExecutionFlow.length} steps (tender→payment→upgrade)`,
    `  offerPack: ${report.offerPack.length} SKUs`,
    `  salesScript: ${report.salesScript.length} beats`,
    `  revenueCapture: ${report.revenueCapture.length} collection points`,
    `  readinessScore: ${report.readinessScore}`,
  ].join("\n");
}

export function runFirstRevenueExecution(input?: { deploymentId?: string }) {
  return buildFirstRevenueExecution(input);
}
