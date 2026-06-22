/**
 * Prisma Stability — deployment gate
 */

import { blockUnsafeDeploy, runPrismaPreflight } from "./prisma.preflight";

export function enforceDeployGate(): void {
  const preflight = runPrismaPreflight();
  blockUnsafeDeploy(preflight);
}

export { runPrismaPreflight, blockUnsafeDeploy };
