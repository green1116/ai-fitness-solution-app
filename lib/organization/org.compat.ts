/**
 * V65 P5 — Organization slug/name compatibility (legacy rows + display)
 */
export function slugifyOrganizationName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "org";
}

export function resolveOrganizationSlug(input: {
  id: string;
  slug?: string | null;
  name?: string | null;
}): string {
  const slug = input.slug?.trim();
  if (slug) return slug;
  const name = input.name?.trim();
  if (name) return slugifyOrganizationName(name);
  return `org-${input.id.slice(0, 8)}`;
}

export function resolveOrganizationDisplayName(
  name: string | null | undefined,
  organizationId: string,
): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  return `Organization ${organizationId.slice(0, 8)}`;
}
