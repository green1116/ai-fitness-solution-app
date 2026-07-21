/**
 * Launch P6 — Documentation Manifest
 */

import { listApiDocumentations } from "./documentation.api";
import { listDeploymentDocumentations } from "./documentation.deployment";
import { listCustomerGuides } from "./documentation.guide";
import { listOperationHandbooks } from "./documentation.handbook";
import { getDocumentationPackage } from "./documentation.package";
import type { DocumentationManifest } from "./documentation.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function buildDocumentationManifest(
  documentationPackageId: string,
): DocumentationManifest {
  const pkg = getDocumentationPackage(documentationPackageId.trim());
  if (!pkg) {
    throw new Error(`documentation package not found: ${documentationPackageId}`);
  }

  const apiDocs = listApiDocumentations({
    documentationPackageId: pkg.id,
  });
  const deploymentDocs = listDeploymentDocumentations({
    documentationPackageId: pkg.id,
  });
  const guides = listCustomerGuides({ documentationPackageId: pkg.id });
  const handbooks = listOperationHandbooks({
    documentationPackageId: pkg.id,
  });

  const apiOk =
    apiDocs.length >= 1 && apiDocs.every((d) => d.status === "PUBLISHED");
  const deployOk =
    deploymentDocs.length >= 1 &&
    deploymentDocs.every((d) => d.status === "PUBLISHED");
  const guideOk =
    guides.length >= 1 && guides.every((g) => g.status === "PUBLISHED");
  const handbookOk =
    handbooks.length >= 1 && handbooks.every((h) => h.status === "PUBLISHED");
  const complete = apiOk && deployOk && guideOk && handbookOk;

  return {
    documentationPackageId: pkg.id,
    packageName: pkg.name,
    version: pkg.version,
    status: pkg.status,
    apiDocIds: apiDocs.map((d) => d.id),
    deploymentDocIds: deploymentDocs.map((d) => d.id),
    customerGuideIds: guides.map((g) => g.id),
    handbookIds: handbooks.map((h) => h.id),
    complete,
    summary: [
      `docs complete=${complete}`,
      `api=${apiDocs.length}`,
      `deployment=${deploymentDocs.length}`,
      `guides=${guides.length}`,
      `handbooks=${handbooks.length}`,
    ].join(" "),
    generatedAt: nowIso(),
  };
}
