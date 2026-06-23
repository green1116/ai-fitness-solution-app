/**
 * V61 P4 — End-to-end journey validation (static)
 */

import fs from "node:fs";
import path from "node:path";

export type JourneyStep = {
  step: string;
  route: string;
  api?: string;
  status: "pass" | "fail";
};

export type JourneyValidationReport = {
  steps: JourneyStep[];
  complete: boolean;
  score: number;
};

const ROOT = path.resolve(process.cwd());

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

export function validateUserJourney(): JourneyValidationReport {
  const steps: JourneyStep[] = [
    { step: "Register", route: "app/(auth)/register/page.tsx", api: "app/api/register/route.ts", status: "pass" },
    { step: "Onboarding", route: "app/(auth)/onboarding/page.tsx", api: "app/api/onboarding/submit/route.ts", status: "pass" },
    { step: "Project", route: "app/(workspace)/projects/page.tsx", api: "app/api/project/create/route.ts", status: "pass" },
    { step: "Quote", route: "app/(product)/quote/page.tsx", api: "app/api/quote/generate/route.ts", status: "pass" },
    { step: "Plan PDF", route: "app/plan/page.tsx", api: "app/api/pdf/route.ts", status: "pass" },
    { step: "Budget PDF", route: "app/(product)/budget/page.tsx", api: "app/api/budget/calculate/route.ts", status: "pass" },
    { step: "Tender Pack", route: "app/(product)/tender/page.tsx", api: "app/api/tender-pack/route.ts", status: "pass" },
    { step: "Document Center", route: "app/(documents)/documents/page.tsx", api: "app/api/documents/summary/route.ts", status: "pass" },
    { step: "Download", route: "app/(documents)/documents/deliveries/page.tsx", api: "app/api/documents/deliveries/route.ts", status: "pass" },
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
