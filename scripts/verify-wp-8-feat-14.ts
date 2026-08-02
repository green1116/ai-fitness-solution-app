/**
 * WP-8 / FEAT-14 — AC-GP01-10 verification.
 * Continue to budget via existing ContinueToBudget API+NAV binding.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SolutionResultScreen } from "../components/screens/result/SolutionResultScreen";
import { getAdapterBinding } from "../lib/frontend/adapter-bindings";
import {
  assertContinueToBudgetBindingReady,
  CONTINUE_TO_BUDGET_ACTION_ID,
  CONTINUE_TO_BUDGET_COMMAND,
  CONTINUE_TO_BUDGET_INT_ID,
  FEAT_14_ID,
  runContinueToBudgetCommand,
} from "../lib/frontend/continue-to-budget-command";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== WP-8 FEAT-14 / AC-GP01-10 ===");

  const binding = getAdapterBinding(CONTINUE_TO_BUDGET_ACTION_ID);
  assert(binding, "ACT-05-05 binding exists");
  assert(binding.command === CONTINUE_TO_BUDGET_COMMAND, "command ContinueToBudget");
  assert(binding.kind === "API+NAV", "API+NAV kind (not NAV-only)");
  assert(
    binding.existingApi === "/api/v80/budget/calculate",
    "reuses existingApi /api/v80/budget/calculate",
  );
  assert(binding.navigateTo === "/budget", 'navigateTo "/budget" reused');
  console.log("PASS existing ContinueToBudget binding reused");

  const plan = assertContinueToBudgetBindingReady();
  assert(plan.requiresHttp === true, "requiresHttp");
  assert(plan.flow === "command", "command flow");
  assert(plan.transport.mode === "existing-api", "existing-api transport");
  assert(plan.navigateTo === "/budget", "plan navigateTo");
  assert(plan.binding?.kind === "API+NAV", "binding API+NAV");
  console.log("PASS planCommandFlow is API+NAV ContinueToBudget");

  let fetchedUrl = "";
  let fetchedMethod = "";
  let fetchedBody = "";
  const result = await runContinueToBudgetCommand({
    projectId: "proj-wp8",
    fetchImpl: (async (input, init) => {
      fetchedUrl = String(input);
      fetchedMethod = String(init?.method ?? "GET");
      fetchedBody = String(init?.body ?? "");
      return Response.json({
        ok: true,
        data: { budgetId: "budget-wp8" },
      });
    }) as typeof fetch,
  });

  assert(result.httpInvoked === true, "httpInvoked");
  assert(result.navigationOnly === false, "navigationOnly false");
  assert(result.localOnly === false, "localOnly false");
  assert(result.httpMethod === "POST", "POST existing budget calculate API");
  assert(result.command === CONTINUE_TO_BUDGET_COMMAND, "result command");
  assert(result.actionId === CONTINUE_TO_BUDGET_ACTION_ID, "result actionId");
  assert(result.featId === FEAT_14_ID, "result featId");
  assert(result.navigateTo === "/budget", "navigateTo /budget");
  assert(
    result.navigateHref === "/budget?projectId=proj-wp8",
    `navigateHref=${result.navigateHref}`,
  );
  assert(
    fetchedUrl === "/api/v80/budget/calculate",
    `fetchedUrl=${fetchedUrl}`,
  );
  assert(fetchedMethod === "POST", `fetchedMethod=${fetchedMethod}`);
  assert(fetchedBody.includes("quoteId"), "request body quoteId");
  assert(result.budgetId === "budget-wp8", "budgetId from response");
  assert(result.settle.navigateTo === "/budget", "settle navigateTo");
  assert(result.settle.serverSlice === "SRV-BUDGET", "SRV-BUDGET settle");
  console.log("PASS UI invokes existing ContinueToBudget HTTP then NAV");

  const html = renderToStaticMarkup(
    createElement(SolutionResultScreen, { projectId: "proj-demo" }),
  );
  assert(html.includes('data-screen="SCR-05"'), "SCR-05");
  assert(html.includes('data-cmp="CMP-FORWARD-GROUP"'), "CMP-FORWARD-GROUP");
  assert(html.includes(`data-feat="${FEAT_14_ID}"`), "FEAT-14 marker");
  assert(
    html.includes(`data-int-id="${CONTINUE_TO_BUDGET_INT_ID}"`),
    "INT-FORWARD-GROUP",
  );
  assert(
    html.includes(`data-action-id="${CONTINUE_TO_BUDGET_ACTION_ID}"`),
    "ACT-05-05",
  );
  assert(
    html.includes(`data-command="${CONTINUE_TO_BUDGET_COMMAND}"`),
    "ContinueToBudget",
  );
  assert(html.includes('data-ac="AC-GP01-10"'), "AC-GP01-10 affordance");
  assert(html.includes('data-navigation-only="false"'), "not navigation-only");
  assert(html.includes('data-local-only="false"'), "not local-only");
  assert(html.includes('data-navigate-to="/budget"'), "navigate-to cue");
  assert(html.includes("/budget?projectId=proj-demo"), "budget href preserved");
  assert(html.includes("Continue to budget"), "budget CTA");
  console.log("PASS SCR-05 UI exposes ContinueToBudget (API+NAV, not local-only)");

  console.log("");
  console.log("PASS AC-GP01-10 — Continue to budget");
  console.log("WP-8 FEAT-14 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
