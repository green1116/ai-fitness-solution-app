/**
 * Operations O3 — Resolution report
 */

import { listSlaMetrics } from "../sla/sla.metrics";
import { listTickets } from "../ticket/ticket.registry";
import { listResolutions } from "./resolution.tracking";
import type {
  GenerateResolutionReportInput,
  SupportResolutionReport,
} from "./resolution.types";

const reports = new Map<string, SupportResolutionReport>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReport(
  report: SupportResolutionReport,
): SupportResolutionReport {
  return { ...report, highlights: [...report.highlights] };
}

export function generateResolutionReport(
  input: GenerateResolutionReportInput = {},
): SupportResolutionReport {
  const accountRef = input.accountRef?.trim();
  const tickets = accountRef
    ? listTickets({ accountRef })
    : listTickets();
  const ticketIds = new Set(tickets.map((t) => t.id));
  const resolutions = listResolutions().filter((r) =>
    ticketIds.has(r.ticketId),
  );
  const sla = listSlaMetrics().filter((m) => ticketIds.has(m.ticketId));

  if (tickets.length < 1 && resolutions.length < 1) {
    throw new Error("insufficient support operations data for report");
  }

  const ticketCount = tickets.length;
  const resolvedCount = resolutions.length;
  const slaHits = sla.filter((m) => m.withinSla).length;
  const slaHitRate =
    sla.length === 0 ? 100 : Math.round((slaHits / sla.length) * 100);

  const id = input.id?.trim() || createId("o3rep");
  if (reports.has(id)) {
    throw new Error(`resolution report already exists: ${id}`);
  }

  const title =
    (input.title ?? "").trim() ||
    `Support Resolution Report${accountRef ? ` — ${accountRef}` : ""}`;
  const highlights = [
    `tickets=${ticketCount}`,
    `resolved=${resolvedCount}`,
    `slaHitRate=${slaHitRate}`,
  ];
  const report: SupportResolutionReport = {
    id,
    title,
    ticketCount,
    resolvedCount,
    slaHitRate,
    highlights,
    detail: `tickets=${ticketCount} resolved=${resolvedCount} sla=${slaHitRate}`,
    generatedAt: nowIso(),
  };
  reports.set(id, report);
  return cloneReport(report);
}

export function getResolutionReport(
  id: string,
): SupportResolutionReport | undefined {
  const report = reports.get(id.trim());
  return report ? cloneReport(report) : undefined;
}

export function listResolutionReports(): SupportResolutionReport[] {
  return [...reports.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneReport);
}

export function clearResolutionReports(): void {
  reports.clear();
}
