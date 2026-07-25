/**
 * Product P3 — AI project creation readiness
 */

import { PRODUCT_P2_ORGANIZATION_WORKSPACE_ID } from "../../p2/organization/organization.constants";
import { listProjectBriefs } from "../project-brief/brief.registry";
import { listProjectTemplates } from "../project-template/template.registry";
import { listFacilities } from "../facility/facility.registry";
import { listGoals } from "../goal/goal.registry";
import { PRODUCT_P3_AI_PROJECT_CREATION_BASE } from "./project.constants";
import { listProjects } from "./project.registry";
import type { P3ReadinessCheck, P3ReadinessResult } from "./project.types";
import { listRequirements } from "../requirement/requirement.registry";
import { listSites } from "../site/site.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P3ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP3AiProjectCreationReadiness(): P3ReadinessResult {
  const checks: P3ReadinessCheck[] = [];

  checks.push(
    check(
      "P3-BASE",
      "foundation",
      "P2 organization workspace baseline aligned",
      PRODUCT_P3_AI_PROJECT_CREATION_BASE ===
        PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
      `base=${PRODUCT_P3_AI_PROJECT_CREATION_BASE}`,
    ),
  );

  const templates = listProjectTemplates();
  checks.push(
    check(
      "P3-TMPL",
      "project-template",
      "Project templates present",
      templates.length >= 1,
      `templates=${templates.length}`,
    ),
  );

  const projects = listProjects();
  checks.push(
    check(
      "P3-PRJ",
      "project",
      "AI projects present",
      projects.length >= 1,
      `projects=${projects.length}`,
    ),
  );

  const briefs = listProjectBriefs();
  checks.push(
    check(
      "P3-BRF",
      "project-brief",
      "Project briefs present",
      briefs.length >= 1,
      `briefs=${briefs.length}`,
    ),
  );

  const sites = listSites();
  checks.push(
    check(
      "P3-SITE",
      "site",
      "Sites present",
      sites.length >= 1,
      `sites=${sites.length}`,
    ),
  );

  const facilities = listFacilities();
  checks.push(
    check(
      "P3-FAC",
      "facility",
      "Facilities present",
      facilities.length >= 1,
      `facilities=${facilities.length}`,
    ),
  );

  const requirements = listRequirements();
  checks.push(
    check(
      "P3-REQ",
      "requirement",
      "Requirements present",
      requirements.length >= 1,
      `requirements=${requirements.length}`,
    ),
  );

  const goals = listGoals();
  checks.push(
    check(
      "P3-GOAL",
      "goal",
      "Goals present",
      goals.length >= 1,
      `goals=${goals.length}`,
    ),
  );

  const activeOrScoped = projects.some(
    (p) => p.status === "SCOPED" || p.status === "ACTIVE",
  );
  checks.push(
    check(
      "P3-LIFE",
      "project",
      "Project lifecycle advanced beyond draft",
      activeOrScoped,
      `advanced=${activeOrScoped}`,
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
    summary: `p3-ai-project-creation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP3AiProjectCreationReadinessReady(
  result: P3ReadinessResult,
): asserts result is P3ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `p3 ai project creation not ready: ${result.summary}`,
    );
  }
}
