/**
 * Launch P4 — Access Review
 * Integrates admin permission + API access
 */

import { evaluateAdminPermission } from "../../product/e12/admin/admin.permission";
import type { AdminPermission } from "../../product/e12/admin/admin.types";
import { evaluateApiCallAccess } from "../../product/e12/api/api.scope";
import { getSecurityProfile, setSecurityProfileStatus } from "./security.profile";
import type {
  AccessReview,
  AccessReviewFinding,
  StartAccessReviewInput,
} from "./security.types";

const reviews = new Map<string, AccessReview>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReview(review: AccessReview): AccessReview {
  return {
    ...review,
    findings: review.findings.map((f) => ({ ...f })),
  };
}

export function startAccessReview(input: StartAccessReviewInput): AccessReview {
  const securityProfileId = input.securityProfileId.trim();
  const profile = getSecurityProfile(securityProfileId);
  if (!profile) {
    throw new Error(`security profile not found: ${securityProfileId}`);
  }

  const id = input.id?.trim() || createId("accessreview");
  if (reviews.has(id)) throw new Error(`access review already exists: ${id}`);

  const findings: AccessReviewFinding[] = [];

  const permission =
    (input.permission?.trim() as AdminPermission | undefined) || "audit:read";
  const adminResult = evaluateAdminPermission({
    userId: profile.reviewerUserId,
    permission,
    organizationId: profile.organizationId,
    productTenantId: profile.productTenantId,
  });
  findings.push({
    target: "ADMIN_PERMISSION",
    ok: adminResult.decision === "ALLOW",
    detail: adminResult.reason,
  });

  findings.push({
    target: "ROLE_ASSIGNMENT",
    ok: adminResult.decision === "ALLOW" && !!adminResult.role,
    detail: adminResult.role
      ? `role=${adminResult.role}`
      : "no role granting permission",
  });

  if (input.apiKeyId && input.apiCatalogEntryId) {
    const apiResult = evaluateApiCallAccess({
      apiKeyId: input.apiKeyId.trim(),
      apiCatalogEntryId: input.apiCatalogEntryId.trim(),
    });
    findings.push({
      target: "API_ACCESS",
      ok: apiResult.decision === "ALLOW",
      detail: apiResult.reason,
    });
  } else {
    findings.push({
      target: "API_ACCESS",
      ok: false,
      detail: "apiKeyId and apiCatalogEntryId required for API access review",
    });
  }

  const passed = findings.every((f) => f.ok);
  const review: AccessReview = {
    id,
    securityProfileId,
    status: passed ? "PASSED" : "FAILED",
    findings,
    passed,
    reviewedAt: nowIso(),
    updatedAt: nowIso(),
  };
  reviews.set(id, review);

  setSecurityProfileStatus(
    securityProfileId,
    passed ? "IN_REVIEW" : "BLOCKED",
  );

  return cloneReview(review);
}

export function getAccessReview(id: string): AccessReview | undefined {
  const review = reviews.get(id.trim());
  return review ? cloneReview(review) : undefined;
}

export function listAccessReviews(filter?: {
  securityProfileId?: string;
}): AccessReview[] {
  let result = [...reviews.values()];
  if (filter?.securityProfileId) {
    const pid = filter.securityProfileId.trim();
    result = result.filter((r) => r.securityProfileId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneReview);
}

export function clearAccessReviews(): void {
  reviews.clear();
}
