/**
 * Operations O3 — Support Operations Release Gate
 * BASE: enterprise-operations-o2-usage-intelligence-foundation-v1
 * Isolated namespace — does not mutate E01–E12, commercialization, launch, o1, or o2 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID } from "../../o2/usage/usage.constants";
import {
  assertO3SupportOperationsReadinessReady,
  clearO3SupportOperationsLayer,
  createO3SupportOperationsManager,
  getO3RegistryManifest,
} from "../support.manager";
import {
  KNOWLEDGE_CATEGORIES,
  O3_MANAGER_STATUSES,
  O3_READINESS_VERDICTS,
  OPERATIONS_O3_SUPPORT_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_BASE,
  OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
  OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION,
  RESOLUTION_OUTCOMES,
  SLA_TARGETS,
  SUPPORT_WORKFLOW_STAGES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../ticket/ticket.constants";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const OPERATIONS_O3_SIGNOFF_VERSION = "operations-o3-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearO3SupportOperationsLayer();
}

export function checkOperationsO3ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "O3-CONSTANTS",
      "ticket",
      "O3 support operations version constants",
      OPERATIONS_O3_SUPPORT_OPERATIONS_ID ===
        "enterprise-operations-o3-support-operations-v1" &&
        OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION === "operations-o3-1" &&
        OPERATIONS_O3_SUPPORT_OPERATIONS_BASE ===
          OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID &&
        OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION ===
          "operations-o3-support-operations-freeze-1" &&
        OPERATIONS_O3_SUPPORT_FREEZE_VERSION ===
          "operations-o3-support-operations-freeze-1" &&
        TICKET_PRIORITIES.length === 4 &&
        TICKET_STATUSES.length === 5 &&
        SUPPORT_WORKFLOW_STAGES.length === 5 &&
        KNOWLEDGE_CATEGORIES.length === 4 &&
        SLA_TARGETS.length === 3 &&
        RESOLUTION_OUTCOMES.length === 4 &&
        O3_READINESS_VERDICTS.length === 3 &&
        O3_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_O3_SUPPORT_OPERATIONS_ID} base=${OPERATIONS_O3_SUPPORT_OPERATIONS_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "O3-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "O3-O2-BASE",
      "operations-o2",
      "O2 usage intelligence foundation BASE preserved",
      OPERATIONS_O3_SUPPORT_OPERATIONS_BASE ===
        "enterprise-operations-o2-usage-intelligence-foundation-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${OPERATIONS_O3_SUPPORT_OPERATIONS_BASE}`,
    ),
  );

  checks.push(
    check(
      "O3-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createO3SupportOperationsManager({
      managerId: "ops-o3-gate",
    });
    mgr.initialize();
    mgr.start();

    const ticket = mgr.registerTicket({
      id: "o3.gate.ticket",
      accountRef: "acme-fitness",
      subject: "Coach console login failure",
      priority: "HIGH",
      requester: "coach.alex",
    });
    mgr.updateTicketStatus({
      ticketId: ticket.id,
      status: "IN_PROGRESS",
    });
    mgr.advanceWorkflow({
      id: "o3.gate.wf",
      ticketId: ticket.id,
      stage: "INVESTIGATE",
      note: "Reproducing auth error",
    });
    mgr.assignSupport({
      id: "o3.gate.asn",
      ticketId: ticket.id,
      assignee: "agent.sam",
      team: "tier-2",
    });
    const article = mgr.publishArticle({
      id: "o3.gate.art",
      title: "Reset coach SSO session",
      category: "TROUBLESHOOT",
      body: "Clear SSO cookies and re-auth via IdP.",
      tags: ["sso", "coach"],
    });
    mgr.indexArticle({
      id: "o3.gate.idx",
      articleId: article.id,
    });
    const policy = mgr.registerSlaPolicy({
      id: "o3.gate.sla",
      name: "High priority first response",
      target: "FIRST_RESPONSE",
      priority: "HIGH",
      thresholdMinutes: 60,
    });
    const sla = mgr.measureSla({
      id: "o3.gate.smet",
      ticketId: ticket.id,
      policyId: policy.id,
      elapsedMinutes: 25,
    });
    const resolution = mgr.trackResolution({
      id: "o3.gate.res",
      ticketId: ticket.id,
      outcome: "FIXED",
      summary: "SSO session reset restored access",
      articleId: article.id,
    });
    mgr.updateTicketStatus({
      ticketId: ticket.id,
      status: "RESOLVED",
    });
    const report = mgr.generateReport({
      id: "o3.gate.report",
      accountRef: "acme-fitness",
      title: "Acme Support Ops Report",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getO3RegistryManifest();

    const ok =
      sla.withinSla === true &&
      resolution.outcome === "FIXED" &&
      report.slaHitRate >= 50 &&
      readiness.verdict === "READY" &&
      registry.foundationId === OPERATIONS_O3_SUPPORT_OPERATIONS_ID &&
      registry.base === OPERATIONS_O3_SUPPORT_OPERATIONS_BASE &&
      registry.ticketCount >= 1 &&
      registry.workflowCount >= 1 &&
      registry.assignmentCount >= 1 &&
      registry.articleCount >= 1 &&
      registry.indexCount >= 1 &&
      registry.policyCount >= 1 &&
      registry.slaMetricsCount >= 1 &&
      registry.resolutionCount >= 1 &&
      registry.reportCount >= 1;

    try {
      assertO3SupportOperationsReadinessReady(readiness);
      checks.push(
        check(
          "O3-STACK",
          "support",
          "Ticket / workflow / knowledge / sla / resolution / readiness",
          ok,
          `sla=${sla.withinSla} outcome=${resolution.outcome} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "O3-STACK",
          "support",
          "Ticket / workflow / knowledge / sla / resolution / readiness",
          false,
          error instanceof Error
            ? error.message
            : "o3 support operations not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "O3-STACK",
        "support",
        "Ticket / workflow / knowledge / sla / resolution / readiness",
        false,
        error instanceof Error
          ? error.message
          : "o3 support operations probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `operations-o3-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsO3ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsO3ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations O3 release gate failed: ${gate.summary}`);
  }
}
