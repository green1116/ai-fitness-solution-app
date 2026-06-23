/**
 * V59 P2 — Document version intelligence (read-only)
 */

import { prisma } from "@/lib/prisma";
import { aggregateDeliveries } from "@/lib/portal/v58/documents/documents.aggregator";
import type { DeliveryRecord } from "@/lib/portal/v58/delivery/delivery.types";

export type VersionDiffItem = {
  field: string;
  from: string;
  to: string;
  changeType: "added" | "removed" | "modified";
};

export type VersionComparison = {
  projectId: string;
  artifactType: string;
  fromVersion: number;
  toVersion: number;
  fromLabel: string;
  toLabel: string;
  diffs: VersionDiffItem[];
  budgetDelta?: { min: number; max: number };
  equipmentDelta?: number;
  documentChanges: number;
};

function versionLabel(record: DeliveryRecord): string {
  return record.isLatest ? `v${record.version} · Latest` : `v${record.version} · Archived`;
}

function compareBudgets(
  older: { totalEstimateMin: number; totalEstimateMax: number; items: unknown },
  newer: { totalEstimateMin: number; totalEstimateMax: number; items: unknown },
): VersionDiffItem[] {
  const diffs: VersionDiffItem[] = [];
  if (older.totalEstimateMin !== newer.totalEstimateMin) {
    diffs.push({
      field: "budget.min",
      from: String(older.totalEstimateMin),
      to: String(newer.totalEstimateMin),
      changeType: "modified",
    });
  }
  if (older.totalEstimateMax !== newer.totalEstimateMax) {
    diffs.push({
      field: "budget.max",
      from: String(older.totalEstimateMax),
      to: String(newer.totalEstimateMax),
      changeType: "modified",
    });
  }
  const oldItems = Array.isArray(older.items) ? older.items.length : 0;
  const newItems = Array.isArray(newer.items) ? newer.items.length : 0;
  if (newItems > oldItems) {
    diffs.push({
      field: "equipment.items",
      from: String(oldItems),
      to: String(newItems),
      changeType: "added",
    });
  } else if (newItems < oldItems) {
    diffs.push({
      field: "equipment.items",
      from: String(oldItems),
      to: String(newItems),
      changeType: "removed",
    });
  }
  return diffs;
}

export async function analyzeProjectVersions(
  organizationId: string,
  projectId: string,
): Promise<VersionComparison[]> {
  const deliveries = await aggregateDeliveries(organizationId);
  const projectDeliveries = deliveries.filter((d) => d.projectId === projectId);

  const comparisons: VersionComparison[] = [];
  const byArtifact = new Map<string, DeliveryRecord[]>();
  for (const d of projectDeliveries) {
    const key = d.artifactType;
    const list = byArtifact.get(key) ?? [];
    list.push(d);
    byArtifact.set(key, list);
  }

  for (const [artifactType, records] of byArtifact) {
    const sorted = [...records].sort((a, b) => b.version - a.version);
    if (sorted.length < 2) continue;
    const latest = sorted[0];
    const previous = sorted[1];
    comparisons.push({
      projectId,
      artifactType,
      fromVersion: previous.version,
      toVersion: latest.version,
      fromLabel: versionLabel(previous),
      toLabel: versionLabel(latest),
      diffs: [
        {
          field: "renderVersion",
          from: previous.renderVersion ?? "—",
          to: latest.renderVersion ?? "—",
          changeType: "modified",
        },
        {
          field: "status",
          from: previous.status,
          to: latest.status,
          changeType: "modified",
        },
      ],
      documentChanges: sorted.length - 1,
    });
  }

  const budgets = await prisma.budget.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: {
      totalEstimateMin: true,
      totalEstimateMax: true,
      items: true,
      createdAt: true,
    },
  });

  if (budgets.length >= 2) {
    const older = budgets[budgets.length - 2];
    const newer = budgets[budgets.length - 1];
    const budgetDiffs = compareBudgets(older, newer);
    if (budgetDiffs.length > 0) {
      comparisons.push({
        projectId,
        artifactType: "budget_pdf",
        fromVersion: budgets.length - 1,
        toVersion: budgets.length,
        fromLabel: `v${budgets.length - 1} · Archived`,
        toLabel: `v${budgets.length} · Latest`,
        diffs: budgetDiffs,
        budgetDelta: {
          min: newer.totalEstimateMin - older.totalEstimateMin,
          max: newer.totalEstimateMax - older.totalEstimateMax,
        },
        equipmentDelta:
          (Array.isArray(newer.items) ? newer.items.length : 0) -
          (Array.isArray(older.items) ? older.items.length : 0),
        documentChanges: budgetDiffs.length,
      });
    }
  }

  return comparisons;
}

export async function analyzeOrganizationVersions(
  organizationId: string,
): Promise<VersionComparison[]> {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    select: { id: true },
  });
  const all: VersionComparison[] = [];
  for (const p of projects) {
    const comps = await analyzeProjectVersions(organizationId, p.id);
    all.push(...comps);
  }
  return all;
}
