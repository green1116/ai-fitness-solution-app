/**
 * V80 Pilot P1 — Mirror production org/project into V80 scaffold (same ids, no duplicate workflow)
 */

import { prisma } from "@/lib/prisma";
import { slugifyName, v80Persist } from "@/lib/scaffold/v80/runtime/store";

export type EnsureV80WorkspaceInput = {
  organizationId: string;
  projectId: string;
  projectName: string;
  adminEmail?: string;
  plan?: "BASIC" | "PRO" | "ENTERPRISE";
};

export async function ensureV80WorkspaceForProduction(
  input: EnsureV80WorkspaceInput,
): Promise<{ organizationId: string; projectId: string }> {
  const orgRow = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    select: { id: true, name: true, slug: true },
  });

  const orgName = orgRow?.name ?? "Pilot Organization";
  const slug = orgRow?.slug ?? slugifyName(orgName);
  const plan = input.plan ?? "PRO";

  const existingOrg = await v80Persist.getOrg(input.organizationId);
  if (!existingOrg) {
    await v80Persist.saveOrg({
      id: input.organizationId,
      name: orgName,
      slug,
      adminEmail: input.adminEmail ?? "pilot@local",
      plan,
      createdAt: new Date(),
    });
  }

  const existingProject = await v80Persist.getProject(input.projectId);
  if (!existingProject) {
    await v80Persist.saveProject({
      id: input.projectId,
      organizationId: input.organizationId,
      name: input.projectName,
      createdAt: new Date(),
    });
  }

  return { organizationId: input.organizationId, projectId: input.projectId };
}
