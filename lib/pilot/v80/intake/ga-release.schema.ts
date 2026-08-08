/**
 * V80 Pilot P20 — GA freeze & release metadata (no new business capability)
 */

export const PILOT_GA_VERSION = "v80-pilot-ga-1.0.0";
export const PILOT_GA_CODENAME = "Intake Intelligence GA";
export const PILOT_GA_RELEASE_DATE = "2026-08-04";

export type GaPilotEntry = {
  id: string;
  name: string;
  verifyScript: string;
  versionConstant?: string;
  status: "ga";
};

export type GaApiRouteEntry = {
  method: string;
  path: string;
  purpose: string;
};

export type GaUiSurfaceEntry = {
  path: string;
  label: string;
};

export type GaArchitectureLayer = {
  id: string;
  title: string;
  modules: string[];
};

export type GaVerificationSummary = {
  pilotsCertified: number;
  verifyScriptsExpected: number;
  verifyScriptsPresent: number;
  apiRoutesExpected: number;
  uiSurfacesExpected: number;
  hardeningVersion: string;
  regressionSuite: string;
  certification: "certified" | "blocked";
  notes: string[];
};

export type GaReleaseManifest = {
  version: typeof PILOT_GA_VERSION;
  codename: typeof PILOT_GA_CODENAME;
  releaseDate: typeof PILOT_GA_RELEASE_DATE;
  generatedAt: string;
  contentHash: string;
  fingerprint: string;
  scope: {
    reuseThrough: "P19";
    engine: "V80";
    noNewBusinessCapability: true;
    projectQuoteTenderModelsUnchanged: true;
  };
  pilots: GaPilotEntry[];
  versionConstants: Record<string, string>;
  apiIndex: GaApiRouteEntry[];
  uiSurfaces: GaUiSurfaceEntry[];
  architecture: GaArchitectureLayer[];
  artifacts: {
    architectureDoc: string;
    apiIndexDoc: string;
    releaseNotesDoc: string;
    changelogDoc: string;
    verificationSummaryDoc: string;
    manifestJson: string;
  };
  verification: GaVerificationSummary;
};
