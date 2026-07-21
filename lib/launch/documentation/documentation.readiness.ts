/**
 * Launch P6 — Documentation Readiness
 * Integrates API product, deployment package, SLA support, security readiness
 */

import { getApiCatalogEntry } from "../../product/e12/api/api.catalog";
import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { evaluateSecurityReadiness } from "../security/security.readiness";
import { evaluateSupportReadiness } from "../support/support.readiness";
import { listApiDocumentations } from "./documentation.api";
import { listDeploymentDocumentations } from "./documentation.deployment";
import { listCustomerGuides } from "./documentation.guide";
import { listOperationHandbooks } from "./documentation.handbook";
import { buildDocumentationManifest } from "./documentation.manifest";
import {
  getDocumentationPackage,
  setDocumentationPackageStatus,
} from "./documentation.package";
import type {
  DocumentationReadinessCheck,
  DocumentationReadinessResult,
} from "./documentation.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): DocumentationReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateDocumentationReadiness(
  documentationPackageId: string,
): DocumentationReadinessResult {
  const pkg = getDocumentationPackage(documentationPackageId.trim());
  if (!pkg) {
    return {
      documentationPackageId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "DOC-PACKAGE",
          "package",
          "Documentation package exists",
          false,
          `package not found: ${documentationPackageId}`,
        ),
      ],
      summary: "documentation readiness not ready: package missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: DocumentationReadinessCheck[] = [];

  const depl = getDeploymentPackage(pkg.deploymentPackageId);
  checks.push(
    check(
      "DOC-DEPLOYMENT",
      "deployment",
      "Deployment package available",
      depl !== undefined &&
        (depl.status === "VALIDATED" || depl.status === "RELEASED"),
      depl
        ? `package=${depl.id} status=${depl.status}`
        : `package not found: ${pkg.deploymentPackageId}`,
    ),
  );

  const apiDocs = listApiDocumentations({
    documentationPackageId: pkg.id,
  });
  const apiLinked =
    apiDocs.length >= 1 &&
    apiDocs.every(
      (d) =>
        d.status === "PUBLISHED" &&
        d.apiCatalogEntryIds.every((id) => !!getApiCatalogEntry(id)),
    );
  checks.push(
    check(
      "DOC-API",
      "api",
      "API documentation published",
      apiLinked,
      `apiDocs=${apiDocs.length} published=${apiLinked}`,
    ),
  );

  const deployDocs = listDeploymentDocumentations({
    documentationPackageId: pkg.id,
  });
  checks.push(
    check(
      "DOC-DEPLOY-GUIDE",
      "deployment-doc",
      "Deployment documentation published",
      deployDocs.length >= 1 &&
        deployDocs.every((d) => d.status === "PUBLISHED"),
      `deploymentDocs=${deployDocs.length}`,
    ),
  );

  const guides = listCustomerGuides({ documentationPackageId: pkg.id });
  checks.push(
    check(
      "DOC-GUIDE",
      "guide",
      "Customer guide published",
      guides.length >= 1 && guides.every((g) => g.status === "PUBLISHED"),
      `guides=${guides.length}`,
    ),
  );

  const handbooks = listOperationHandbooks({
    documentationPackageId: pkg.id,
  });
  checks.push(
    check(
      "DOC-HANDBOOK",
      "handbook",
      "Operation handbook published",
      handbooks.length >= 1 && handbooks.every((h) => h.status === "PUBLISHED"),
      `handbooks=${handbooks.length}`,
    ),
  );

  if (pkg.securityProfileId) {
    const security = evaluateSecurityReadiness(pkg.securityProfileId);
    checks.push(
      check(
        "DOC-SECURITY",
        "security",
        "Security readiness READY",
        security.verdict === "READY",
        security.summary,
      ),
    );
  } else {
    checks.push(
      check(
        "DOC-SECURITY",
        "security",
        "Security profile bound",
        false,
        "security profile not bound",
      ),
    );
  }

  if (pkg.supportSlaProfileId) {
    const support = evaluateSupportReadiness(pkg.supportSlaProfileId);
    checks.push(
      check(
        "DOC-SUPPORT",
        "support",
        "SLA support readiness READY",
        support.verdict === "READY",
        support.summary,
      ),
    );
  } else {
    checks.push(
      check(
        "DOC-SUPPORT",
        "support",
        "SLA support profile bound",
        false,
        "support sla profile not bound",
      ),
    );
  }

  const manifest = buildDocumentationManifest(pkg.id);
  checks.push(
    check(
      "DOC-MANIFEST",
      "manifest",
      "Documentation manifest complete",
      manifest.complete === true,
      manifest.summary,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  if (verdict === "READY" && pkg.status !== "PUBLISHED") {
    setDocumentationPackageStatus(pkg.id, "PUBLISHED");
  }

  return {
    documentationPackageId: pkg.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: [
      `documentation-readiness verdict=${verdict}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
    evaluatedAt: nowIso(),
  };
}

export function assertDocumentationReadinessReady(
  result: DocumentationReadinessResult,
): asserts result is DocumentationReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`documentation not ready: ${result.summary}`);
  }
}
