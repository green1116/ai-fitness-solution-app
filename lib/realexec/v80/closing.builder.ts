/**
 * V80 REAL EXEC P2 — First deal closing builder (read-only GTM P2 consumer)
 */
import { buildFirstRevenueExecution } from "@/lib/gtm/v80/execution.builder";
import { V80_GTM_EXECUTION_VERSION } from "@/lib/gtm/v80/execution.types";

import { FIRST_CONTACT_SCRIPT, isFirstContactScriptComplete } from "./closing.first-contact.spec";
import { DEMO_FLOW_30MIN, isDemoFlowComplete } from "./closing.demo-flow.spec";
import { isObjectionHandlingComplete, OBJECTION_HANDLING } from "./closing.objections.spec";
import { CLOSING_SCRIPT, isClosingScriptComplete } from "./closing.close-script.spec";
import type { ClosingManifest, FirstDealClosingReport } from "./closing.types";
import { V80_REALEXEC_CLOSING_FREEZE_VERSION, V80_REALEXEC_CLOSING_VERSION } from "./closing.types";

export function buildClosingManifest(input: { executionReady: boolean }): ClosingManifest {
  const contactComplete = isFirstContactScriptComplete();
  const demoComplete = isDemoFlowComplete();
  const objectionComplete = isObjectionHandlingComplete();
  const closeComplete = isClosingScriptComplete();

  const closingComplete =
    input.executionReady && contactComplete && demoComplete && objectionComplete && closeComplete;

  return {
    version: V80_REALEXEC_CLOSING_VERSION,
    executionVersion: V80_GTM_EXECUTION_VERSION,
    contactScripts: FIRST_CONTACT_SCRIPT.length,
    demoSteps: DEMO_FLOW_30MIN.length,
    objectionResponses: OBJECTION_HANDLING.length,
    closingBeats: CLOSING_SCRIPT.length,
    closingComplete,
    summary: `closing complete=${closingComplete} demo=${DEMO_FLOW_30MIN.length} steps`,
  };
}

export function buildFirstDealClosing(input?: { deploymentId?: string }): FirstDealClosingReport {
  const deploymentId = input?.deploymentId ?? "v80-realexec-closing";
  const revenueExecution = buildFirstRevenueExecution({ deploymentId });
  const manifest = buildClosingManifest({ executionReady: revenueExecution.executionReady });

  const closingReady = revenueExecution.executionReady && manifest.closingComplete;

  return {
    version: V80_REALEXEC_CLOSING_VERSION,
    freezeVersion: V80_REALEXEC_CLOSING_FREEZE_VERSION,
    reportId: `realexec-closing-${deploymentId}`,
    executionReady: revenueExecution.executionReady,
    manifest,
    firstContact: FIRST_CONTACT_SCRIPT,
    demoFlow: DEMO_FLOW_30MIN,
    objectionHandling: OBJECTION_HANDLING,
    closingScript: CLOSING_SCRIPT,
    revenueExecution,
    closingReady,
    readinessScore: closingReady ? 100 : 0,
    summary: `closing ready=${closingReady} execution=${revenueExecution.executionReady}`,
  };
}

export function assertFirstDealClosingPass(
  report: FirstDealClosingReport,
): asserts report is FirstDealClosingReport & { closingReady: true } {
  if (!report.closingReady) {
    throw new Error(`V80 REAL EXEC closing not ready: ${report.summary}`);
  }
}

export function formatClosingSummary(report: FirstDealClosingReport): string {
  return [
    `V80 REAL EXEC P2 First Deal Closing`,
    `  version: ${report.version}`,
    `  closingReady: ${report.closingReady}`,
    `  firstContact: ${report.firstContact.length} scripts`,
    `  demoFlow: ${report.demoFlow.length} steps (30 min)`,
    `  objectionHandling: ${report.objectionHandling.length} responses`,
    `  closingScript: ${report.closingScript.length} beats`,
    `  readinessScore: ${report.readinessScore}`,
  ].join("\n");
}

export function runFirstDealClosing(input?: { deploymentId?: string }) {
  return buildFirstDealClosing(input);
}
