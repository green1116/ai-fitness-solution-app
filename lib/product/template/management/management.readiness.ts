/**
 * Product Template — readiness
 */

import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { listTemplateDefinitions } from "../definition/definition.registry";
import { listTemplatePublishes } from "../publish/publish.registry";
import { listTemplateVariables } from "../variable/variable.registry";
import { listTemplateVariants } from "../variant/variant.registry";
import { PRODUCT_TEMPLATE_MANAGEMENT_BASE } from "./management.constants";
import type {
  TemplateReadinessCheck,
  TemplateReadinessResult,
} from "./management.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): TemplateReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateTemplateManagementReadiness(): TemplateReadinessResult {
  const checks: TemplateReadinessCheck[] = [];

  checks.push(
    check(
      "TPL-BASE",
      "management",
      "Notification foundation aligned",
      PRODUCT_TEMPLATE_MANAGEMENT_BASE === PRODUCT_NOTIFICATION_FOUNDATION_ID,
      `base=${PRODUCT_TEMPLATE_MANAGEMENT_BASE}`,
    ),
  );

  const definitions = listTemplateDefinitions();
  checks.push(
    check(
      "TPL-DEF",
      "definition",
      "Active template definitions present",
      definitions.some((d) => d.status === "ACTIVE"),
      `definitions=${definitions.length}`,
    ),
  );

  const variants = listTemplateVariants();
  checks.push(
    check(
      "TPL-VAR",
      "variant",
      "Template variants present",
      variants.length >= 1,
      `variants=${variants.length}`,
    ),
  );

  const variables = listTemplateVariables();
  checks.push(
    check(
      "TPL-KEY",
      "variable",
      "Template variables present",
      variables.length >= 1,
      `variables=${variables.length}`,
    ),
  );

  const publishes = listTemplatePublishes();
  checks.push(
    check(
      "TPL-PUB",
      "publish",
      "Active publishes present",
      publishes.some((p) => p.status === "ACTIVE"),
      `publishes=${publishes.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-template readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertTemplateManagementReadinessReady(
  result: TemplateReadinessResult,
): asserts result is TemplateReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product template management not ready: ${result.summary}`,
    );
  }
}
