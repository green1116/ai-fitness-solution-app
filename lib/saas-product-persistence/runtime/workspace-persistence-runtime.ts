import { PERSISTENCE_WORKSPACE_STATUSES } from "../shared/persistence-constants";
import { PERSISTENCE_ERROR_CODES, SaasProductPersistenceError } from "../shared/persistence-errors";
import type {
  CreateWorkspacePersistedInput,
  UpdateWorkspaceStatusPersistedInput,
  WorkspaceRecord,
  WorkspaceStatus,
} from "../shared/persistence-types";
import { workspaceRepository } from "../repositories/workspace-repository";

function assertTenantId(tenantId: string): void {
  if (!tenantId.trim()) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH,
      "tenantId is required",
    );
  }
}

function assertWorkspaceName(name: string): void {
  if (!name.trim()) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_WORKSPACE_REQUIRED,
      "workspace name is required",
    );
  }
}

function assertWorkspaceStatus(status: WorkspaceStatus): void {
  if (!PERSISTENCE_WORKSPACE_STATUSES.includes(status)) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_TRANSITION,
      `workspace status must be ACTIVE or ARCHIVED, got: ${status}`,
    );
  }
}

export async function createWorkspacePersisted(
  input: CreateWorkspacePersistedInput,
): Promise<WorkspaceRecord> {
  assertTenantId(input.tenantId);
  assertWorkspaceName(input.name);
  return workspaceRepository.create({
    tenantId: input.tenantId,
    name: input.name.trim(),
    status: "ACTIVE",
  });
}

export async function resolveWorkspacePersisted(
  workspaceId: string,
  tenantId: string,
): Promise<WorkspaceRecord | null> {
  assertTenantId(tenantId);
  return workspaceRepository.findById(workspaceId, tenantId);
}

export async function listWorkspacesPersisted(tenantId: string): Promise<WorkspaceRecord[]> {
  assertTenantId(tenantId);
  return workspaceRepository.listByTenant(tenantId);
}

export async function updateWorkspaceStatusPersisted(
  input: UpdateWorkspaceStatusPersistedInput,
): Promise<WorkspaceRecord> {
  assertTenantId(input.tenantId);
  assertWorkspaceStatus(input.status);
  return workspaceRepository.update(input.workspaceId, input.tenantId, {
    status: input.status,
  });
}

export async function archiveWorkspacePersisted(
  workspaceId: string,
  tenantId: string,
): Promise<WorkspaceRecord> {
  assertTenantId(tenantId);
  return workspaceRepository.archive(workspaceId, tenantId);
}

export const workspacePersistenceRuntime = {
  create: createWorkspacePersisted,
  resolve: resolveWorkspacePersisted,
  list: listWorkspacesPersisted,
  updateStatus: updateWorkspaceStatusPersisted,
  archive: archiveWorkspacePersisted,
} as const;
