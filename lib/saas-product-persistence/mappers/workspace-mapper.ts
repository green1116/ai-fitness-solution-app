import type { Workspace as PrismaWorkspace } from "@prisma/client";
import type { WorkspaceRecord, WorkspaceStatus } from "../shared/persistence-types";

function toIso(date: Date): string {
  return date.toISOString();
}

export function toWorkspaceDomain(row: PrismaWorkspace): WorkspaceRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    status: row.status as WorkspaceStatus,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function toNullableWorkspaceDomain(row: PrismaWorkspace | null): WorkspaceRecord | null {
  return row ? toWorkspaceDomain(row) : null;
}
