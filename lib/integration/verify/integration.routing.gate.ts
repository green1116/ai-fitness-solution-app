/**
 * PI-5.2 — Integration routing verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { INTEGRATION_BINDING_KINDS } from "../foundation/binding-kinds";
import { INTEGRATION_FOUNDATION_ID } from "../foundation/integration.constants";
import {
  INTEGRATION_POINT_CATALOGUE,
  INTEGRATION_POINT_IDS,
} from "../foundation/integration-points";
import { INTEGRATION_PIPELINE_STAGES } from "../foundation/pipeline-stages";
import {
  INTEGRATION_FOUNDATION_REF,
  INTEGRATION_ROUTING_GATE,
  INTEGRATION_ROUTING_LAYER_ID,
} from "../routing/routing.constants";
import {
  INTEGRATION_DOMAIN_IDS,
  DOMAIN_INTEGRATION_POINT,
} from "../routing/domain-stage-routing";
import {
  GOLDEN_PATH_IDS,
  GOLDEN_PATH_ROUTING,
} from "../routing/golden-path-routing";
import {
  BINDING_KIND_WORKFLOW_BIAS,
  resolveIntegrationRoutePlan,
} from "../routing/integration-route-plan";
import {
  HTTP_PIPELINE_STAGES,
  STAGE_DEFAULT_POINTS,
} from "../routing/stage-routing";
import {
  INTEGRATION_WORKFLOW_CATALOGUE,
  INTEGRATION_WORKFLOW_IDS,
} from "../routing/workflow-kinds";
import { runIntegrationFoundationGate } from "./integration.foundation.gate";

export type IntegrationRoutingCheck = Readonly<{
  id: string;
  source: "PI-5.1" | "PI-5.2" | "PD-6.1" | "PD-6.3";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type IntegrationRoutingReport = Readonly<{
  layer: "PI-5.2";
  layerId: typeof INTEGRATION_ROUTING_LAYER_ID;
  gateId: typeof INTEGRATION_ROUTING_GATE;
  passed: boolean;
  checks: readonly IntegrationRoutingCheck[];
  summary: Readonly<{
    workflows: number;
    bindingKinds: number;
    goldenPaths: number;
    domains: number;
    foundationPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: IntegrationRoutingCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): IntegrationRoutingCheck {
  return {
    id,
    source,
    title,
    status: ok ? "PASS" : "FAIL",
    evidence,
  };
}

function resolveRoot(rootDir?: string): string {
  return rootDir ? path.resolve(rootDir) : path.resolve(__dirname, "../../..");
}

function listTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsFiles(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

export function runIntegrationRoutingGate(
  rootDir?: string,
): IntegrationRoutingReport {
  const root = resolveRoot(rootDir);
  const checks: IntegrationRoutingCheck[] = [];

  const foundation = runIntegrationFoundationGate(root);
  checks.push(
    check(
      "INTR-FOUNDATION",
      "PI-5.1",
      "PI-5.1 integration foundation intact for routing",
      foundation.passed &&
        foundation.foundationId === INTEGRATION_FOUNDATION_ID &&
        INTEGRATION_FOUNDATION_REF === INTEGRATION_FOUNDATION_ID,
      `points=${foundation.summary.integrationPoints} stages=${foundation.summary.pipelineStages}`,
    ),
  );

  checks.push(
    check(
      "INTR-IDS",
      "PI-5.2",
      "Integration routing layer IDs locked; closed workflow set",
      INTEGRATION_ROUTING_LAYER_ID === "product-integration-routing-v1" &&
        INTEGRATION_ROUTING_GATE === "product-integration-routing-gate" &&
        INTEGRATION_WORKFLOW_IDS.length === 6 &&
        INTEGRATION_WORKFLOW_CATALOGUE.length === 6 &&
        GOLDEN_PATH_IDS.length === 5,
      `layer=${INTEGRATION_ROUTING_LAYER_ID} workflows=${INTEGRATION_WORKFLOW_IDS.length}`,
    ),
  );

  const routeMatch = INTEGRATION_BINDING_KINDS.every((kind) => {
    try {
      const domain =
        kind === "NAV" || kind === "PREF" ? null : ("M13" as const);
      const plan = resolveIntegrationRoutePlan(kind, domain);
      return (
        plan.matchesFoundation &&
        plan.foundationId === INTEGRATION_FOUNDATION_ID &&
        plan.layerId === INTEGRATION_ROUTING_LAYER_ID &&
        plan.pointIds.every((id) =>
          (INTEGRATION_POINT_IDS as readonly string[]).includes(id),
        ) &&
        plan.points.every((p) =>
          INTEGRATION_POINT_CATALOGUE.some((c) => c.pointId === p.pointId),
        ) &&
        plan.workflows.every((w) =>
          (INTEGRATION_WORKFLOW_IDS as readonly string[]).includes(w),
        )
      );
    } catch {
      return false;
    }
  });
  const httpFull = resolveIntegrationRoutePlan("API", "M11");
  const navOnly = resolveIntegrationRoutePlan("NAV");
  checks.push(
    check(
      "INTR-MATCH",
      "PI-5.2",
      "Routing matches integration foundation",
      routeMatch &&
        httpFull.stages.length === HTTP_PIPELINE_STAGES.length &&
        httpFull.pointIds.includes("INTP-DOMAIN-M11") &&
        navOnly.stages.length === 1 &&
        navOnly.stages[0] === "UI" &&
        !navOnly.touchesDomain,
      `kinds=${INTEGRATION_BINDING_KINDS.length} httpStages=${httpFull.stages.length}`,
    ),
  );

  const pointsReuse = Object.values(STAGE_DEFAULT_POINTS)
    .flat()
    .every((id) =>
      INTEGRATION_POINT_CATALOGUE.some((p) => p.pointId === id),
    );
  const domainPointsOk = INTEGRATION_DOMAIN_IDS.every((d) => {
    const pointId = DOMAIN_INTEGRATION_POINT[d];
    const point = INTEGRATION_POINT_CATALOGUE.find(
      (p) => p.pointId === pointId,
    );
    return (
      !!point &&
      point.stageId === "DOMAIN" &&
      fs.existsSync(path.join(root, point.modulePath))
    );
  });
  checks.push(
    check(
      "INTR-POINTS",
      "PI-5.2",
      "Existing integration points reused",
      pointsReuse &&
        domainPointsOk &&
        INTEGRATION_PIPELINE_STAGES.every(
          (s) => STAGE_DEFAULT_POINTS[s].length > 0,
        ),
      `defaultPoints ok domains=${INTEGRATION_DOMAIN_IDS.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "INTR-NO-NEW-DOMAIN",
      "PI-5.2",
      "No new Domain",
      forbidden.length === 0 && INTEGRATION_DOMAIN_IDS.length === 5,
      forbidden.length ? forbidden.join(",") : "M11–M15 only",
    ),
  );

  checks.push(
    check(
      "INTR-NO-NEW-FAM",
      "PD-6.3",
      "No new integration families",
      INTEGRATION_WORKFLOW_IDS.length === 6 &&
        GOLDEN_PATH_ROUTING.length === 5 &&
        Object.keys(BINDING_KIND_WORKFLOW_BIAS).length ===
          INTEGRATION_BINDING_KINDS.length &&
        !fs.existsSync(path.join(root, "lib/integration/routing/families")) &&
        !fs.existsSync(path.join(root, "lib/integration/new-workflows")),
      `workflows=${INTEGRATION_WORKFLOW_IDS.length} gps=${GOLDEN_PATH_ROUTING.length}`,
    ),
  );

  const routingFiles = listTsFiles(path.join(root, "lib/integration/routing"));
  const coupleHits = routingFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data)|from\s+["'][^"']*lib\/(frontend|backend|data)/.test(
      text,
    );
  });
  checks.push(
    check(
      "INTR-NO-COUPLE",
      "PI-5.2",
      "No FE/BE/Data coupling in integration routing",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${routingFiles.length}`,
    ),
  );

  const spot =
    resolveIntegrationRoutePlan("NEAREST", "M12").pointIds.includes(
      "INTP-DOMAIN-M12",
    ) &&
    resolveIntegrationRoutePlan("API+NAV", "M14").workflows.includes(
      "WF-NAV",
    ) &&
    GOLDEN_PATH_ROUTING.find((g) => g.pathId === "GP-04")?.dominantWorkflows[0] ===
      "WF-READ";
  checks.push(
    check(
      "INTR-SPOT",
      "PD-6.1",
      "Golden route plans bind Domain points and workflow bias",
      spot,
      "NEAREST+M12 / API+NAV+M14 / GP-04=WF-READ",
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-5.2",
    layerId: INTEGRATION_ROUTING_LAYER_ID,
    gateId: INTEGRATION_ROUTING_GATE,
    passed,
    checks,
    summary: {
      workflows: INTEGRATION_WORKFLOW_IDS.length,
      bindingKinds: INTEGRATION_BINDING_KINDS.length,
      goldenPaths: GOLDEN_PATH_IDS.length,
      domains: INTEGRATION_DOMAIN_IDS.length,
      foundationPassed: foundation.passed,
    },
  };
}

export function assertIntegrationRoutingGate(
  report: IntegrationRoutingReport = runIntegrationRoutingGate(),
): IntegrationRoutingReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-5.2 Integration routing gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
