/**
 * Operations O3 — Support operations readiness
 */

import { OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID } from "../../o2/usage/usage.constants";
import { listKnowledgeArticles } from "../knowledge/knowledge.article";
import { listKnowledgeIndex } from "../knowledge/knowledge.index";
import { listSlaMetrics } from "../sla/sla.metrics";
import { listSlaPolicies } from "../sla/sla.policy";
import { listSupportAssignments } from "../support/support.assignment";
import { listSupportWorkflows } from "../support/support.workflow";
import { OPERATIONS_O3_SUPPORT_OPERATIONS_BASE } from "../ticket/ticket.constants";
import { listTickets } from "../ticket/ticket.registry";
import { listResolutionReports } from "./resolution.report";
import { listResolutions } from "./resolution.tracking";
import type { O3ReadinessCheck, O3ReadinessResult } from "./resolution.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): O3ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateO3SupportOperationsReadiness(): O3ReadinessResult {
  const checks: O3ReadinessCheck[] = [];

  checks.push(
    check(
      "O3-BASE",
      "foundation",
      "O2 usage intelligence foundation baseline aligned",
      OPERATIONS_O3_SUPPORT_OPERATIONS_BASE ===
        OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
      `base=${OPERATIONS_O3_SUPPORT_OPERATIONS_BASE}`,
    ),
  );

  const tickets = listTickets();
  checks.push(
    check(
      "O3-TKT",
      "ticket",
      "Support tickets present",
      tickets.length >= 1,
      `tickets=${tickets.length}`,
    ),
  );

  const workflows = listSupportWorkflows();
  checks.push(
    check(
      "O3-WF",
      "support",
      "Support workflows present",
      workflows.length >= 1,
      `workflows=${workflows.length}`,
    ),
  );

  const assignments = listSupportAssignments();
  checks.push(
    check(
      "O3-ASN",
      "support",
      "Support assignments present",
      assignments.length >= 1,
      `assignments=${assignments.length}`,
    ),
  );

  const articles = listKnowledgeArticles();
  checks.push(
    check(
      "O3-ART",
      "knowledge",
      "Knowledge articles present",
      articles.length >= 1,
      `articles=${articles.length}`,
    ),
  );

  const index = listKnowledgeIndex();
  checks.push(
    check(
      "O3-IDX",
      "knowledge",
      "Knowledge index present",
      index.length >= 1,
      `index=${index.length}`,
    ),
  );

  const policies = listSlaPolicies();
  checks.push(
    check(
      "O3-SLA",
      "sla",
      "SLA policies present",
      policies.length >= 1,
      `policies=${policies.length}`,
    ),
  );

  const slaMetrics = listSlaMetrics();
  checks.push(
    check(
      "O3-SMET",
      "sla",
      "SLA metrics present",
      slaMetrics.length >= 1,
      `slaMetrics=${slaMetrics.length}`,
    ),
  );

  const resolutions = listResolutions();
  checks.push(
    check(
      "O3-RES",
      "resolution",
      "Resolutions present",
      resolutions.length >= 1,
      `resolutions=${resolutions.length}`,
    ),
  );

  const reports = listResolutionReports();
  checks.push(
    check(
      "O3-REP",
      "resolution",
      "Resolution reports present",
      reports.length >= 1,
      `reports=${reports.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `o3-support-operations readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertO3SupportOperationsReadinessReady(
  result: O3ReadinessResult,
): asserts result is O3ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `o3 support operations not ready: ${result.summary}`,
    );
  }
}
