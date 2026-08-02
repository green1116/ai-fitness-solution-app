/**
 * WP-7 / FEAT-13 — AC-GP01-09 verification.
 * Review planning solution via existing ReviewSolution binding (not local/NAV-only).
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SolutionResultScreen } from "../components/screens/result/SolutionResultScreen";
import { getAdapterBinding } from "../lib/frontend/adapter-bindings";
import {
  assertReviewSolutionBindingReady,
  FEAT_13_ID,
  REVIEW_SOLUTION_ACTION_ID,
  REVIEW_SOLUTION_COMMAND,
  REVIEW_SOLUTION_INT_ID,
  runReviewSolutionCommand,
} from "../lib/frontend/review-solution-command";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== WP-7 FEAT-13 / AC-GP01-09 ===");

  const binding = getAdapterBinding(REVIEW_SOLUTION_ACTION_ID);
  assert(binding, "ACT-05-01 binding exists");
  assert(binding.command === REVIEW_SOLUTION_COMMAND, "command ReviewSolution");
  assert(binding.kind === "API", "API kind");
  assert(
    binding.existingApi === "/api/v80/pdf?type=plan",
    "reuses existingApi /api/v80/pdf?type=plan",
  );
  assert(binding.navigateTo === null, "navigateTo null — not navigation-only");
  console.log("PASS existing ReviewSolution binding reused");

  const plan = assertReviewSolutionBindingReady();
  assert(plan.requiresHttp === true, "requiresHttp");
  assert(plan.flow === "command", "command flow");
  assert(plan.transport.mode === "existing-api", "existing-api transport");
  assert(plan.navigateTo === null, "plan navigateTo null");
  assert(plan.binding?.kind === "API", "binding API");
  console.log("PASS planCommandFlow is HTTP ReviewSolution (not NAV)");

  let fetchedUrl = "";
  let fetchedMethod = "";
  const result = await runReviewSolutionCommand({
    projectId: "proj-wp7",
    fetchImpl: (async (input, init) => {
      fetchedUrl = String(input);
      fetchedMethod = String(init?.method ?? "GET");
      return new Response(new Uint8Array([37, 80, 68, 70, 45, 49]), {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      });
    }) as typeof fetch,
  });

  assert(result.httpInvoked === true, "httpInvoked");
  assert(result.navigationOnly === false, "navigationOnly false");
  assert(result.localOnly === false, "localOnly false");
  assert(result.httpMethod === "GET", "GET existing plan PDF API");
  assert(result.command === REVIEW_SOLUTION_COMMAND, "result command");
  assert(result.actionId === REVIEW_SOLUTION_ACTION_ID, "result actionId");
  assert(result.featId === FEAT_13_ID, "result featId");
  assert(fetchedUrl.startsWith("/api/v80/pdf"), `fetchedUrl=${fetchedUrl}`);
  assert(fetchedUrl.includes("type=plan"), "type=plan reused");
  assert(fetchedUrl.includes("projectId=proj-wp7"), "projectId query");
  assert(fetchedMethod === "GET", `fetchedMethod=${fetchedMethod}`);
  assert(result.review.byteLength === 6, "artifact bytes");
  assert(result.review.contentType === "application/pdf", "contentType");
  assert(result.settle.navigateTo === null, "settle does not navigate");
  assert(result.settle.serverSlice === "SRV-SOLUTION", "SRV-SOLUTION settle");
  console.log("PASS UI invokes existing ReviewSolution plan PDF HTTP flow");

  const html = renderToStaticMarkup(
    createElement(SolutionResultScreen, { projectId: "proj-demo" }),
  );
  assert(html.includes('data-screen="SCR-05"'), "SCR-05");
  assert(html.includes('data-cmp="CMP-RESULT-SUMMARY"'), "CMP-RESULT-SUMMARY");
  assert(html.includes(`data-feat="${FEAT_13_ID}"`), "FEAT-13 marker");
  assert(html.includes(`data-int-id="${REVIEW_SOLUTION_INT_ID}"`), "INT-RESULT-REVIEW");
  assert(
    html.includes(`data-action-id="${REVIEW_SOLUTION_ACTION_ID}"`),
    "ACT-05-01",
  );
  assert(html.includes(`data-command="${REVIEW_SOLUTION_COMMAND}"`), "ReviewSolution");
  assert(html.includes('data-ac="AC-GP01-09"'), "AC-GP01-09 affordance");
  assert(html.includes('data-navigation-only="false"'), "not navigation-only");
  assert(html.includes('data-local-only="false"'), "not local-only");
  assert(html.includes("Review planning solution"), "review CTA");
  assert(html.includes('type="button"'), "button control");
  assert(html.includes("ACT-05-02"), "ACT-05-02 preserved in action-ids");
  assert(
    !html.includes(`data-command="${REVIEW_SOLUTION_COMMAND}" href=`),
    "ReviewSolution is not a link",
  );
  console.log("PASS SCR-05 UI exposes ReviewSolution control (not NAV/local-only)");

  console.log("");
  console.log(
    "PASS AC-GP01-09 — Review planning solution and configuration",
  );
  console.log("WP-7 FEAT-13 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
