/**
 * PI-4.2 — Domain → primary repository bias (PD-5.4 OWN / RB rules).
 * Aligns with PI-4.1 REPO ownership; no new repo families.
 */
import type { ProductDomainId } from "../../backend/foundation/domain-ownership";
import type { RepositoryId } from "../foundation/repository-catalogue";

/** Primary Domain → allowed repository owners (bias for access planning). */
export const DOMAIN_REPOSITORY_BIAS: Record<
  ProductDomainId,
  readonly RepositoryId[]
> = {
  M11: ["REPO-KNOWLEDGE", "REPO-ARTIFACT"],
  M12: ["REPO-AGENT-RUN"],
  M13: [
    "REPO-PROJECT",
    "REPO-TENANT-USER",
    "REPO-SESSION",
    "REPO-OPS-AUDIT",
  ],
  M14: ["REPO-INTELLIGENCE"],
  M15: ["REPO-EVOLUTION"],
};

export function repositoriesAllowedForDomain(
  domainId: ProductDomainId,
): readonly RepositoryId[] {
  return DOMAIN_REPOSITORY_BIAS[domainId];
}

export function domainOwnsRepository(
  domainId: ProductDomainId,
  repositoryId: RepositoryId,
): boolean {
  return DOMAIN_REPOSITORY_BIAS[domainId].includes(repositoryId);
}
