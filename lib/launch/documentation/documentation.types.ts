/**
 * Launch P6 — Documentation Package types
 */

import type {
  API_DOC_SECTIONS,
  CUSTOMER_GUIDE_SECTIONS,
  DEPLOYMENT_DOC_SECTIONS,
  DOCUMENT_STATUSES,
  DOCUMENTATION_MANAGER_STATUSES,
  DOCUMENTATION_PACKAGE_STATUSES,
  DOCUMENTATION_READINESS_VERDICTS,
  HANDBOOK_SECTIONS,
  LAUNCH_DOCUMENTATION_BASE,
  LAUNCH_DOCUMENTATION_FREEZE_VERSION,
  LAUNCH_DOCUMENTATION_ID,
  LAUNCH_DOCUMENTATION_VERSION,
} from "./documentation.constants";

export type DocumentationPackageStatus =
  (typeof DOCUMENTATION_PACKAGE_STATUSES)[number];
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export type ApiDocSection = (typeof API_DOC_SECTIONS)[number];
export type DeploymentDocSection = (typeof DEPLOYMENT_DOC_SECTIONS)[number];
export type CustomerGuideSection = (typeof CUSTOMER_GUIDE_SECTIONS)[number];
export type HandbookSection = (typeof HANDBOOK_SECTIONS)[number];
export type DocumentationReadinessVerdict =
  (typeof DOCUMENTATION_READINESS_VERDICTS)[number];
export type DocumentationManagerStatus =
  (typeof DOCUMENTATION_MANAGER_STATUSES)[number];

export type DocumentationMetadata = Record<string, unknown>;

export type DocSectionRecord<T extends string> = {
  section: T;
  title: string;
  body: string;
  complete: boolean;
};

/** Documentation package root. */
export type DocumentationPackage = {
  id: string;
  name: string;
  productId: string;
  productionProfileId: string;
  deploymentPackageId: string;
  securityProfileId?: string;
  supportSlaProfileId?: string;
  version: string;
  status: DocumentationPackageStatus;
  metadata: DocumentationMetadata;
  createdAt: string;
};

export type CreateDocumentationPackageInput = {
  id?: string;
  name: string;
  productId: string;
  productionProfileId: string;
  deploymentPackageId: string;
  securityProfileId?: string;
  supportSlaProfileId?: string;
  version?: string;
  status?: DocumentationPackageStatus;
  metadata?: DocumentationMetadata;
};

/** API documentation model. */
export type ApiDocumentation = {
  id: string;
  documentationPackageId: string;
  apiCatalogEntryIds: string[];
  title: string;
  sections: DocSectionRecord<ApiDocSection>[];
  status: DocumentStatus;
  metadata: DocumentationMetadata;
  updatedAt: string;
};

export type CreateApiDocumentationInput = {
  id?: string;
  documentationPackageId: string;
  apiCatalogEntryIds: string[];
  title: string;
  status?: DocumentStatus;
  metadata?: DocumentationMetadata;
};

/** Deployment documentation. */
export type DeploymentDocumentation = {
  id: string;
  documentationPackageId: string;
  deploymentPackageId: string;
  title: string;
  sections: DocSectionRecord<DeploymentDocSection>[];
  status: DocumentStatus;
  metadata: DocumentationMetadata;
  updatedAt: string;
};

export type CreateDeploymentDocumentationInput = {
  id?: string;
  documentationPackageId: string;
  title: string;
  status?: DocumentStatus;
  metadata?: DocumentationMetadata;
};

/** Customer guide. */
export type CustomerGuide = {
  id: string;
  documentationPackageId: string;
  title: string;
  audience: string;
  sections: DocSectionRecord<CustomerGuideSection>[];
  status: DocumentStatus;
  metadata: DocumentationMetadata;
  updatedAt: string;
};

export type CreateCustomerGuideInput = {
  id?: string;
  documentationPackageId: string;
  title: string;
  audience?: string;
  status?: DocumentStatus;
  metadata?: DocumentationMetadata;
};

/** Operation handbook. */
export type OperationHandbook = {
  id: string;
  documentationPackageId: string;
  title: string;
  sections: DocSectionRecord<HandbookSection>[];
  status: DocumentStatus;
  metadata: DocumentationMetadata;
  updatedAt: string;
};

export type CreateOperationHandbookInput = {
  id?: string;
  documentationPackageId: string;
  title: string;
  status?: DocumentStatus;
  metadata?: DocumentationMetadata;
};

/** Documentation manifest. */
export type DocumentationManifest = {
  documentationPackageId: string;
  packageName: string;
  version: string;
  status: DocumentationPackageStatus;
  apiDocIds: string[];
  deploymentDocIds: string[];
  customerGuideIds: string[];
  handbookIds: string[];
  complete: boolean;
  summary: string;
  generatedAt: string;
};

/** Readiness. */
export type DocumentationReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type DocumentationReadinessResult = {
  documentationPackageId: string;
  verdict: DocumentationReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: DocumentationReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type DocumentationRegistryManifest = {
  documentationId: typeof LAUNCH_DOCUMENTATION_ID;
  version: typeof LAUNCH_DOCUMENTATION_VERSION;
  freezeVersion: typeof LAUNCH_DOCUMENTATION_FREEZE_VERSION;
  base: typeof LAUNCH_DOCUMENTATION_BASE;
  packageCount: number;
  apiDocCount: number;
  deploymentDocCount: number;
  customerGuideCount: number;
  handbookCount: number;
};
