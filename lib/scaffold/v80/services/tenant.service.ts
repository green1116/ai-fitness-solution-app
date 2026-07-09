/** @scaffold BLP-API-001 → tenant provisioning */
import { randomUUID } from "node:crypto";

import { V80RuntimeError } from "../runtime/errors";
import { withV80Lock } from "../runtime/lock";
import { slugifyName, v80Persist } from "../runtime/store";

export type ProvisionTenantInput = {
  organizationName: string;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  adminEmail: string;
};

export async function provisionTenant(input: ProvisionTenantInput) {
  const slug = slugifyName(input.organizationName);

  return withV80Lock(`tenant:slug:${slug}`, async () => {
    if (await v80Persist.findOrgBySlug(slug)) {
      throw new V80RuntimeError("Organization slug exists", "SLUG_CONFLICT", 409);
    }

    const orgId = randomUUID();
    const projectId = randomUUID();
    const now = new Date();

    await v80Persist.saveOrg({
      id: orgId,
      name: input.organizationName,
      slug,
      adminEmail: input.adminEmail,
      plan: input.plan,
      createdAt: now,
    });

    await v80Persist.saveProject({
      id: projectId,
      organizationId: orgId,
      name: `${input.organizationName} Workspace`,
      createdAt: now,
    });

    await v80Persist.incrementUsage(orgId, "tenant_provision");

    return { organizationId: orgId, workspaceId: projectId, slug, plan: input.plan };
  });
}
