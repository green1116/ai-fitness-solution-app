/**
 * WP-1 / FEAT-10 — AC-GP01-03 verification.
 * Start fitness space planning via existing StartPlanning binding (not NAV-only).
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BuilderEntryScreen } from "../components/screens/entry/BuilderEntryScreen";
import { getAdapterBinding } from "../lib/frontend/adapter-bindings";
import {
  assertStartPlanningBindingReady,
  FEAT_10_ACTION_ID,
  FEAT_10_COMMAND,
  FEAT_10_ID,
  FEAT_10_INT_ID,
  runStartPlanningCommand,
} from "../lib/frontend/start-planning-command";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== WP-1 FEAT-10 / AC-GP01-03 ===");

  const binding = getAdapterBinding(FEAT_10_ACTION_ID);
  assert(binding, "ACT-02-01 binding exists");
  assert(binding.command === FEAT_10_COMMAND, "command StartPlanning");
  assert(binding.kind === "NEAREST", "NEAREST kind");
  assert(
    binding.existingApi === "/api/v80/tenant/run",
    "reuses existingApi /api/v80/tenant/run",
  );
  assert(binding.navigateTo === null, "navigateTo null — not navigation-only");
  console.log("PASS existing StartPlanning binding reused");

  const plan = assertStartPlanningBindingReady();
  assert(plan.requiresHttp === true, "requiresHttp");
  assert(plan.flow === "command", "command flow");
  assert(plan.transport.mode === "existing-api", "existing-api transport");
  assert(
    plan.transport.mode === "existing-api" &&
      plan.transport.routeRef === binding.existingApi,
    "transport route = binding.existingApi",
  );
  assert(plan.navigateTo === null, "plan navigateTo null");
  console.log("PASS planCommandFlow is HTTP StartPlanning (not NAV)");

  let fetchedUrl = "";
  let fetchedMethod = "";
  let fetchedBody: Record<string, unknown> | null = null;
  const result = await runStartPlanningCommand({
    bootstrap: {
      organizationName: "WP1 Fitness Planning Verify",
      plan: "BASIC",
      adminEmail: "wp1.verify@local.test",
    },
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
          organizationId: "org-wp1",
          workspaceId: "ws-wp1",
          slug: "wp1-fitness-planning-verify",
          plan: "BASIC",
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    }) as typeof fetch,
  });

  assert(result.httpInvoked === true, "httpInvoked");
  assert(result.navigationOnly === false, "navigationOnly false");
  assert(result.command === FEAT_10_COMMAND, "result command");
  assert(result.actionId === FEAT_10_ACTION_ID, "result actionId");
  assert(result.featId === FEAT_10_ID, "result featId");
  assert(fetchedUrl === "/api/v80/tenant/run", `fetchedUrl=${fetchedUrl}`);
  assert(fetchedMethod === "POST", `fetchedMethod=${fetchedMethod}`);
  assert(
    fetchedBody?.organizationName === "WP1 Fitness Planning Verify",
    "bootstrap body posted",
  );
  assert(result.organizationId === "org-wp1", "organizationId mapped");
  assert(result.workspaceId === "ws-wp1", "workspaceId mapped");
  assert(result.settle.navigateTo === null, "settle does not navigate");
  assert(result.settle.serverSlice === "SRV-INPUTS", "SRV-INPUTS settle");
  console.log("PASS UI command triggers existing StartPlanning HTTP flow");

  const html = renderToStaticMarkup(createElement(BuilderEntryScreen));
  assert(html.includes('data-screen="SCR-02"'), "SCR-02");
  assert(html.includes('data-cmp="CMP-GUIDE-PANEL"'), "CMP-GUIDE-PANEL");
  assert(html.includes(`data-feat="${FEAT_10_ID}"`), "FEAT-10 marker");
  assert(html.includes(`data-int-id="${FEAT_10_INT_ID}"`), "INT-INTAKE-START");
  assert(html.includes(`data-action-id="${FEAT_10_ACTION_ID}"`), "ACT-02-01");
  assert(html.includes(`data-command="${FEAT_10_COMMAND}"`), "StartPlanning");
  assert(html.includes('data-ac="AC-GP01-03"'), "AC-GP01-03 affordance");
  assert(html.includes('data-navigation-only="false"'), "not navigation-only");
  assert(html.includes("Start fitness space planning"), "start CTA label");
  assert(html.includes('type="button"'), "button control");
  assert(
    !html.includes('href="/workspace" data-command="StartPlanning"') &&
      !html.includes(`data-command="${FEAT_10_COMMAND}" href=`),
    "StartPlanning is not a link",
  );
  console.log("PASS SCR-02 UI exposes StartPlanning control (not NAV-only)");

  console.log("");
  console.log("PASS AC-GP01-03 — Start fitness space planning");
  console.log("WP-1 FEAT-10 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});