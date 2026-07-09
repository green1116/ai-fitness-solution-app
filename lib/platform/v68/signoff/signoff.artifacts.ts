/**
 * V68 P8 — Platform sign-off artifact surface (read-only)
 */
export type PlatformSignoffArtifactSurface = {
  signoffDoc: string;
  freezeDoc: string;
  verifySignoff: string;
  verifyPlatform: string;
};

export const V68_PLATFORM_SIGNOFF_ARTIFACT_SURFACE: PlatformSignoffArtifactSurface = {
  signoffDoc: "docs/platform/V68-PLATFORM-SIGNOFF.md",
  freezeDoc: "docs/platform/V68-PLATFORM-FREEZE.md",
  verifySignoff: "npm run verify:v68-p8-platform-signoff",
  verifyPlatform: "npm run verify:v68-platform",
};

export function getPlatformSignoffArtifactPath(
  key: keyof PlatformSignoffArtifactSurface,
): string {
  return V68_PLATFORM_SIGNOFF_ARTIFACT_SURFACE[key];
}
