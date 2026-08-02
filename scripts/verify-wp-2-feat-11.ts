/**
 * WP-2 / FEAT-11 — AC-GP01-04 verification.
 * Submit planning inputs via existing SubmitPlanningInputs binding (not local/NAV-only).
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BuilderEntryScreen } from "../components/screens/entry/BuilderEntryScreen";
import { getAdapterBinding } from "../lib/frontend/adapter-bindings";
import {
  assertSubmitPlanningInputsBindingReady,
  FEAT_11_ACTION_ID,
  FEAT_11_COMMAND,
  FEAT_11_ID,
  FEAT_11_INT_ID,
  mapBudgetTierCue,
  mapCompanySizeCue,
  runSubmitPlanningInputsCommand,
} from "../lib/frontend/submit-planning-inputs-command";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== WP-2 FEAT-11 / AC-GP01-04 ===");

  const binding = getAdapterBinding(FEAT_11_ACTION_ID);
  assert(binding, "ACT-02-02 binding exists");
  assert(binding.command === FEAT_11_COMMAND, "command SubmitPlanningInputs");
  assert(binding.kind === "NEAREST", "NEAREST kind");
  assert(
    binding.existingApi === "/api/v80/budget/calculate",
    "reuses existingApi /api/v80/budget/calculate",
  );
  assert(binding.navigateTo === null, "navigateTo null — not navigation-only");
  console.log("PASS existing SubmitPlanningInputs binding reused");

  const plan = assertSubmitPlanningInputsBindingReady();
  assert(plan.requiresHttp === true, "requiresHttp");
  assert(plan.flow === "command", "command flow");
  assert(plan.transport.mode === "existing-api", "existing-api transport");
  assert(
    plan.transport.mode === "existing-api" &&
      plan.transport.routeRef === binding.existingApi,
    "transport route = binding.existingApi",
  );
  assert(plan.navigateTo === null, "plan navigateTo null");
  console.log("PASS planCommandFlow is HTTP SubmitPlanningInputs (not NAV)");

  assert(mapCompanySizeCue("200–500") === 200, "company size cue map");
  assert(mapBudgetTierCue("premium") === "high", "budget tier cue map");

  let fetchedUrl = "";
  let fetchedMethod = "";
  let fetchedBody: Record<string, unknown> | null = null;
  const draft = {
    companySize: "200–500",
    location: "Shanghai",
    space: "1200 sqm",
    budget: "mid",
    goals: "Employee wellness gym",
  };
  const result = await runSubmitPlanningInputsCommand({
    draft,
    quoteId: "quote-wp2-verify",
    organizationId: "org-wp2-verify",
    fetchImpl: (async (input, init) => {
      fetchedUrl = String(input);
      fetchedMethod = String(init?.method ?? "GET");
      fetchedBody = JSON.parse(String(init?.body ?? "{}")) as Record<
        string,
        unknown
      >;
      return new Response(
        JSON.stringify({
          ok: true,
          budgetId: "budget-wp2",
          totals: { equipment: 160000, tier: "mid", companySize: 200 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as typeof fetch,
  });

  assert(result.httpInvoked === true, "httpInvoked");
  assert(result.navigationOnly === false, "navigationOnly false");
  assert(result.localOnly === false, "localOnly false");
  assert(result.command === FEAT_11_COMMAND, "result command");
  assert(result.actionId === FEAT_11_ACTION_ID, "result actionId");
  assert(result.featId === FEAT_11_ID, "result featId");
  assert(fetchedUrl === "/api/v80/budget/calculate", `fetchedUrl=${fetchedUrl}`);
  assert(fetchedMethod === "POST", `fetchedMethod=${fetchedMethod}`);
  assert(fetchedBody?.quoteId === "quote-wp2-verify", "quoteId posted");
  assert(fetchedBody?.organizationId === "org-wp2-verify", "organizationId posted");
  assert(fetchedBody?.companySize === 200, "companySize posted");
  assert(fetchedBody?.budgetTier === "mid", "budgetTier posted");
  assert(result.submittedInputs.companySize === draft.companySize, "companySize submitted");
  assert(result.submittedInputs.location === draft.location, "location submitted");
  assert(result.submittedInputs.space === draft.space, "space submitted");
  assert(result.submittedInputs.budget === draft.budget, "budget submitted");
  assert(result.submittedInputs.goals === draft.goals, "goals submitted");
  assert(result.budgetId === "budget-wp2", "budgetId mapped");
  assert(result.settle.navigateTo === null, "settle does not navigate");
  assert(result.settle.serverSlice === "SRV-INPUTS", "SRV-INPUTS settle");
  console.log(
    "PASS UI submits company size/location/space/budget/goals via HTTP binding",
  );

  const html = renderToStaticMarkup(createElement(BuilderEntryScreen));
  assert(html.includes('data-screen="SCR-02"'), "SCR-02");
  assert(html.includes('data-cmp="CMP-INPUT-PLANNING"'), "CMP-INPUT-PLANNING");
  assert(html.includes(`data-feat="${FEAT_11_ID}"`), "FEAT-11 marker");
  assert(html.includes(`data-int-id="${FEAT_11_INT_ID}"`), "INT-INTAKE-INPUT");
  assert(html.includes(`data-action-id="${FEAT_11_ACTION_ID}"`), "ACT-02-02");
  assert(html.includes(`data-command="${FEAT_11_COMMAND}"`), "SubmitPlanningInputs");
  assert(html.includes('data-ac="AC-GP01-04"'), "AC-GP01-04 affordance");
  assert(html.includes('data-navigation-only="false"'), "not navigation-only");
  assert(html.includes('data-local-only="false"'), "not local-only");
  assert(html.includes('name="companySize"'), "companySize field");
  assert(html.includes('name="location"'), "location field");
  assert(html.includes('name="space"'), "space field");
  assert(html.includes('name="budget"'), "budget field");
  assert(html.includes('name="goals"'), "goals field");
  assert(html.includes("Submit planning inputs"), "submit CTA");
  assert(html.includes('type="submit"'), "submit control");
  assert(
    !html.includes(`data-command="${FEAT_11_COMMAND}" href=`),
    "SubmitPlanningInputs is not a link",
  );
  console.log("PASS SCR-02 UI exposes SubmitPlanningInputs form (not NAV/local-only)");

  console.log("");
  console.log("PASS AC-GP01-04 — Provide company size, location, space, budget, goals");
  console.log("WP-2 FEAT-11 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
