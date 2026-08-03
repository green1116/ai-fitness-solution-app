/**
 * WP-71 — Export Engine
 * Deterministic export items from DashboardItems (read-only).
 */
import { getDashboard, type DashboardItem } from "./dashboard";

export const FEAT_72_ID = "FEAT-72" as const;
export const EXPORT_ENGINE_CAPABILITY = "ExportEngine" as const;

export const EXPORT_FORMATS = ["JSON", "CSV", "PDF"] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export type ExportItem = Readonly<{
  id: string;
  dashboardId: string;
  format: ExportFormat;
  position: number;
}>;

export type BuildExportInput = Readonly<{
  dashboards?: readonly DashboardItem[];
}>;

const FORMAT_RANK: Record<ExportFormat, number> = {
  JSON: 0,
  CSV: 1,
  PDF: 2,
};

let cachedExport: ExportItem[] | null = null;

function cloneItem(row: ExportItem): ExportItem {
  return { ...row };
}

/**
 * Build deterministic export items from DashboardItems.
 * Each dashboard yields JSON / CSV / PDF; sorted JSON → CSV → PDF, then dashboardId.
 */
export function buildExport(input: BuildExportInput = {}): ExportItem[] {
  const dashboards = input.dashboards ? [...input.dashboards] : getDashboard();

  const ranked: Array<{ dashboardId: string; format: ExportFormat }> = [];
  for (const d of dashboards) {
    for (const format of EXPORT_FORMATS) {
      ranked.push({ dashboardId: d.id, format });
    }
  }

  ranked.sort((a, b) => {
    const byFormat = FORMAT_RANK[a.format] - FORMAT_RANK[b.format];
    if (byFormat !== 0) return byFormat;
    return a.dashboardId.localeCompare(b.dashboardId);
  });

  const out: ExportItem[] = ranked.map((row, index) => ({
    id: `export-${row.dashboardId}-${row.format}`,
    dashboardId: row.dashboardId,
    format: row.format,
    position: index + 1,
  }));

  cachedExport = out.map(cloneItem);
  return cachedExport.map(cloneItem);
}

/**
 * Get the last built exports, or build if none cached.
 */
export function getExport(): ExportItem[] {
  if (!cachedExport) {
    return buildExport();
  }
  return cachedExport.map(cloneItem);
}

/** Test helper — clears cached exports. */
export function clearExport(): void {
  cachedExport = null;
}
