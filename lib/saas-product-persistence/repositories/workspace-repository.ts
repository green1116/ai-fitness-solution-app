import { prisma } from "@/lib/prisma";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceRecord,
} from "../shared/persistence-types";
import { PERSISTENCE_ERROR_CODES, SaasProductPersistenceError } from "../shared/persistence-errors";
import { toNullableWorkspaceDomain, toWorkspaceDomain } from "../mappers/workspace-mapper";
import type { WorkspaceRepository } from "../contracts/persistence-contracts";

async function requireWorkspace(id: string, tenantId: string): Promise<WorkspaceRecord> {
  const row = await prisma.workspace.findFirst({
    where: { id, tenantId },
  });
  const domain = toNullableWorkspaceDomain(row);
  if (!domain) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_NOT_FOUND,
      `Workspace not found: ${id}`,
    );
  }
  return domain;
}

export const workspaceRepository: WorkspaceRepository = {
  async create(input: CreateWorkspaceInput): Promise<WorkspaceRecord> {
    const row = await prisma.workspace.create({
      data: {
        tenantId: input.tenantId,
        name: input.name,
        status: input.status ?? "ACTIVE",
      },
    });
    return toWorkspaceDomain(row);
  },

  async findById(id: string, tenantId: string): Promise<WorkspaceRecord | null> {
    const row = await prisma.workspace.findFirst({
      where: { id, tenantId },
    });
    return toNullableWorkspaceDomain(row);
  },

  async update(id: string, tenantId: string, input: UpdateWorkspaceInput): Promise<WorkspaceRecord> {
    await requireWorkspace(id, tenantId);
    const row = await prisma.workspace.update({
      where: { id },
      data: {
        name: input.name,
        status: input.status,
      },
    });
    return toWorkspaceDomain(row);
  },

  async archive(id: string, tenantId: string): Promise<WorkspaceRecord> {
    return workspaceRepository.update(id, tenantId, { status: "ARCHIVED" });
  },

  async restore(id: string, tenantId: string): Promise<WorkspaceRecord> {
    return workspaceRepository.update(id, tenantId, { status: "ACTIVE" });
  },

  async listByTenant(tenantId: string): Promise<WorkspaceRecord[]> {
    const rows = await prisma.workspace.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toWorkspaceDomain);
  },
};

export const createWorkspace = workspaceRepository.create.bind(workspaceRepository);
export const findWorkspaceById = workspaceRepository.findById.bind(workspaceRepository);
export const updateWorkspace = workspaceRepository.update.bind(workspaceRepository);
export const archiveWorkspace = workspaceRepository.archive.bind(workspaceRepository);
export const restoreWorkspace = workspaceRepository.restore.bind(workspaceRepository);
export const listWorkspacesByTenant = workspaceRepository.listByTenant.bind(workspaceRepository);
