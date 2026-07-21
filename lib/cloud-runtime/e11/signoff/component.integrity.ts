/**
 * E11-P8 — Component Integrity Check
 * Validates locked component catalog structure and on-disk paths
 */

import {
  E11_P8_COMPONENT_LOCK,
  type E11P8ComponentLock,
} from "./governance.freeze.lock";

export type E11P8ComponentIntegrityResult = {
  ok: boolean;
  checked: number;
  missing: string[];
  failures: string[];
  summary: string;
};

export function validateE11P8ComponentLockStructure(): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  const requiredIds = [
    "p1-foundation",
    "p2-execution",
    "p3-tenant",
    "p4-governance",
    "p5-observability",
    "p6-autonomous",
    "p7-control-plane",
    "signoff",
  ] as const;

  if (E11_P8_COMPONENT_LOCK.length !== requiredIds.length) {
    failures.push(
      `component count expected=${requiredIds.length} actual=${E11_P8_COMPONENT_LOCK.length}`,
    );
  }

  for (const id of requiredIds) {
    const entry = E11_P8_COMPONENT_LOCK.find((c) => c.id === id);
    if (!entry) {
      failures.push(`missing component lock: ${id}`);
      continue;
    }
    if (!entry.path.startsWith("lib/cloud-runtime/e11/")) {
      failures.push(`invalid path prefix for ${id}: ${entry.path}`);
    }
    if (entry.required !== true) {
      failures.push(`component ${id} must be required`);
    }
  }

  const seen = new Set<string>();
  for (const component of E11_P8_COMPONENT_LOCK) {
    if (seen.has(component.id)) {
      failures.push(`duplicate component id: ${component.id}`);
    }
    seen.add(component.id);
  }

  return { ok: failures.length === 0, failures };
}

export function checkE11P8ComponentIntegrity(
  pathExists: (relativePath: string) => boolean,
  components: E11P8ComponentLock[] = E11_P8_COMPONENT_LOCK,
): E11P8ComponentIntegrityResult {
  const structure = validateE11P8ComponentLockStructure();
  const missing: string[] = [];
  const failures = [...structure.failures];

  for (const component of components) {
    if (!pathExists(component.path)) {
      missing.push(component.path);
      failures.push(`missing path: ${component.path} (${component.label})`);
    }
  }

  const ok = structure.ok && missing.length === 0;
  return {
    ok,
    checked: components.length,
    missing,
    failures,
    summary: [
      `component-integrity ok=${ok}`,
      `checked=${components.length}`,
      `missing=${missing.length}`,
    ].join(" "),
  };
}
