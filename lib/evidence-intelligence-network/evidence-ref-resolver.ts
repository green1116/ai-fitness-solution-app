import type { BrandEvidenceLink } from "@/lib/brand-intelligence-network";
import type { EvidenceKind } from "./shared/types";

export function slugifyEvidenceRef(ref: string): string {
  return ref
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function buildEvidenceIdFromLink(link: BrandEvidenceLink): string {
  const slug = slugifyEvidenceRef(link.evidenceRef);
  return `ev-intel-${link.brandId}-${link.evidenceKind}-${slug}`;
}

export function buildEvidenceTitle(link: BrandEvidenceLink): string {
  const kindLabel: Record<EvidenceKind, string> = {
    certificate: "Certification Evidence",
    datasheet: "Product Datasheet Evidence",
    "test-report": "Test Report Evidence",
    authorization: "Authorization Letter Evidence",
    "case-study": "Case Study Evidence",
    "project-reference": "Project Reference Evidence",
  };
  const base = kindLabel[link.evidenceKind as EvidenceKind] ?? "Evidence Record";
  if (link.sku) return `${base} — ${link.sku}`;
  return `${base} — ${link.brandId}`;
}

export function mapLinkStatusToEvidenceStatus(
  link: BrandEvidenceLink,
  rank: number,
): import("./shared/types").EvidenceStatus {
  if (link.validUntil) {
    const expiry = new Date(link.validUntil).getTime();
    if (!Number.isNaN(expiry) && expiry < Date.now()) return "expired";
  }
  if (link.linkStatus === "archived") return "archived";
  const statuses: import("./shared/types").EvidenceStatus[] = [
    "registered",
    "verified",
    "linked",
    "covered",
  ];
  return statuses[(rank - 1) % statuses.length]!;
}

export function normalizeEvidenceRef(ref: string): string {
  return ref.trim();
}
