/**
 * V62 P12 — Pilot journey validation (static)
 */

import fs from "node:fs";
import path from "node:path";

export type PilotJourneyStep = {
  step: string;
  route: string;
  api?: string;
  status: "pass" | "fail";
};

export type PilotJourneyReport = {
  steps: PilotJourneyStep[];
  complete: boolean;
  score: number;
};

const ROOT = path.resolve(process.cwd());

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

export function validatePilotJourney(): PilotJourneyReport {
  const steps: PilotJourneyStep[] = [
    { step: "Intake", route: "app/(pilot)/pilot/intake/page.tsx", api: "app/api/pilot/v80/intake/upload/route.ts", status: "pass" },
    { step: "Pilot Center", route: "app/(pilot)/pilot/page.tsx", api: "app/api/pilot/health/route.ts", status: "pass" },
    { step: "Program", route: "app/(pilot)/pilot/program/page.tsx", api: "app/api/pilot/program/route.ts", status: "pass" },
    { step: "Feedback", route: "app/(pilot)/pilot/feedback/page.tsx", api: "app/api/pilot/feedback/route.ts", status: "pass" },
    { step: "Telemetry", route: "app/(pilot)/pilot/telemetry/page.tsx", api: "app/api/pilot/telemetry/route.ts", status: "pass" },
    { step: "Issues", route: "app/(pilot)/pilot/issues/page.tsx", api: "app/api/pilot/issues/route.ts", status: "pass" },
    { step: "Funnel", route: "app/(pilot)/pilot/funnel/page.tsx", api: "app/api/pilot/funnel/route.ts", status: "pass" },
    { step: "Support", route: "app/(pilot)/pilot/support/page.tsx", api: "app/api/pilot/support/route.ts", status: "pass" },
    { step: "Scale Decision", route: "app/(pilot)/pilot/page.tsx", api: "app/api/pilot/scale-decision/route.ts", status: "pass" },
  ];

  for (const s of steps) {
    const routeOk = exists(s.route);
    const apiOk = s.api ? exists(s.api) : true;
    s.status = routeOk && apiOk ? "pass" : "fail";
  }

  const passed = steps.filter((s) => s.status === "pass").length;
  return {
    steps,
    complete: passed === steps.length,
    score: Math.round((passed / steps.length) * 100),
  };
}
