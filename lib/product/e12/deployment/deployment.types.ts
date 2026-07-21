/**
 * E12-P6 — Deployment Package types
 */

import type {
  DEPLOYMENT_CONFIG_SCOPES,
  DEPLOYMENT_MANAGER_STATUSES,
  DEPLOYMENT_PACKAGE_STATUSES,
  E12_DEPLOYMENT_PACKAGE_BASE,
  E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
  E12_DEPLOYMENT_PACKAGE_ID,
  E12_DEPLOYMENT_PACKAGE_VERSION,
  ENVIRONMENT_PROFILE_KINDS,
  ENVIRONMENT_PROFILE_STATUSES,
  RELEASE_ARTIFACT_STATUSES,
  VALIDATION_VERDICTS,
} from "./deployment.constants";
import type { ProductMetadata } from "../types/product.types";

export type DeploymentPackageStatus =
  (typeof DEPLOYMENT_PACKAGE_STATUSES)[number];
export type EnvironmentProfileKind =
  (typeof ENVIRONMENT_PROFILE_KINDS)[number];
export type EnvironmentProfileStatus =
  (typeof ENVIRONMENT_PROFILE_STATUSES)[number];
export type DeploymentConfigScope = (typeof DEPLOYMENT_CONFIG_SCOPES)[number];
export type ValidationVerdict = (typeof VALIDATION_VERDICTS)[number];
export type ReleaseArtifactStatus = (typeof RELEASE_ARTIFACT_STATUSES)[number];
export type DeploymentManagerStatus =
  (typeof DEPLOYMENT_MANAGER_STATUSES)[number];

export type { ProductMetadata };

/** Deployment package model. */
export type DeploymentPackage = {
  id: string;
  productId: string;
  editionId: string;
  pricingPlanId?: string;
  name: string;
  version: string;
  status: DeploymentPackageStatus;
  tenantProductLayerId: string;
  apiProductLayerId: string;
  billingCommercialLayerId: string;
  metadata: ProductMetadata;
  createdAt: string;
};

export type CreateDeploymentPackageInput = {
  id?: string;
  productId: string;
  editionId: string;
  pricingPlanId?: string;
  name: string;
  version?: string;
  status?: DeploymentPackageStatus;
  metadata?: ProductMetadata;
};

/** Environment profile. */
export type EnvironmentProfile = {
  id: string;
  deploymentPackageId: string;
  kind: EnvironmentProfileKind;
  name: string;
  region: string;
  status: EnvironmentProfileStatus;
  variables: Record<string, string>;
  metadata: ProductMetadata;
  createdAt: string;
};

export type CreateEnvironmentProfileInput = {
  id?: string;
  deploymentPackageId: string;
  kind: EnvironmentProfileKind;
  name: string;
  region?: string;
  status?: EnvironmentProfileStatus;
  variables?: Record<string, string>;
  metadata?: ProductMetadata;
};

/** Enterprise deployment configuration. */
export type EnterpriseDeploymentConfig = {
  id: string;
  deploymentPackageId: string;
  environmentProfileId?: string;
  scope: DeploymentConfigScope;
  key: string;
  value: unknown;
  metadata: ProductMetadata;
  updatedAt: string;
};

export type SetEnterpriseDeploymentConfigInput = {
  id?: string;
  deploymentPackageId: string;
  environmentProfileId?: string;
  scope: DeploymentConfigScope;
  key: string;
  value: unknown;
  metadata?: ProductMetadata;
};

/** Deployment validation result. */
export type DeploymentValidationCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type DeploymentValidationResult = {
  deploymentPackageId: string;
  verdict: ValidationVerdict;
  passCount: number;
  failCount: number;
  checks: DeploymentValidationCheck[];
  summary: string;
  validatedAt: string;
};

/** Release artifact. */
export type ReleaseArtifact = {
  id: string;
  deploymentPackageId: string;
  environmentProfileId: string;
  checksum: string;
  status: ReleaseArtifactStatus;
  artifactUri: string;
  metadata: ProductMetadata;
  builtAt: string;
};

export type BuildReleaseArtifactInput = {
  id?: string;
  deploymentPackageId: string;
  environmentProfileId: string;
  artifactUri?: string;
  metadata?: ProductMetadata;
};

/** Installation manifest. */
export type InstallationManifest = {
  deploymentPackageId: string;
  environmentProfileId: string;
  productFoundationReady: boolean;
  tenantProductLayerId: string;
  apiProductLayerId: string;
  billingCommercialLayerId: string;
  editionId: string;
  pricingPlanId?: string;
  artifactId?: string;
  artifactChecksum?: string;
  ready: boolean;
  summary: string;
  generatedAt: string;
};

export type DeploymentRegistryManifest = {
  deploymentPackageId: typeof E12_DEPLOYMENT_PACKAGE_ID;
  version: typeof E12_DEPLOYMENT_PACKAGE_VERSION;
  freezeVersion: typeof E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION;
  base: typeof E12_DEPLOYMENT_PACKAGE_BASE;
  packageCount: number;
  environmentCount: number;
  configCount: number;
  artifactCount: number;
};
