import { z } from "zod";

export const createWorkspaceBodySchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  tenantId: z.string().optional(),
});

export const updateWorkspaceStatusBodySchema = z.object({
  status: z.enum(["ACTIVE", "ARCHIVED"]),
  tenantId: z.string().optional(),
});

export type CreateWorkspaceBody = z.infer<typeof createWorkspaceBodySchema>;
export type UpdateWorkspaceStatusBody = z.infer<typeof updateWorkspaceStatusBodySchema>;
