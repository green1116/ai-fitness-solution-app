/**
 * V3.7-H16 Dashboard Shell & Command Center Entry — smoke verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  PRODUCTION_DASHBOARD_SHELL_VERSION,
  DASHBOARD_SHELL_NAV_VERSION,
  DASHBOARD_SHELL_SUMMARY_VERSION,
  buildDashboardShellFoundation,
  buildDashboardShellSummary,
  getDashboardShellNavigation,
} from "../lib/commercialization/dashboard-shell/index";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testDashboardPageHasCommandCenterLink() {
  const pagePath = join(process.cwd(), "app/dashboard/page.tsx");
  const content = readFileSync(pagePath, "utf-8");
  assert(content.includes("/dashboard/command-center"), "dashboard page missing command center href");
  assert(content.includes("Command Center"), "dashboard page missing command center label");
  assert(content.includes("unified ops"), "dashboard page missing unified ops text");
  assert(content.includes("governance"), "dashboard page missing governance text");
  assert(content.includes("audit"), "dashboard page missing audit text");
  assert(content.includes("release"), "dashboard page missing release text");
  assert(content.includes("access"), "dashboard page missing access text");
  assert(content.includes("observability"), "dashboard page missing observability text");

  console.log("✓ dashboard main entry contains command center link");
  console.log(" ", "route=/dashboard → /dashboard/command-center");
}

function testShellSummaryShape() {
  const summary = buildDashboardShellSummary({ deploymentId: "h16-shell" });
  assert(summary.version === DASHBOARD_SHELL_SUMMARY_VERSION, "summary version");
  assert(summary.summaryId.includes("DSS-V37H16"), "summary id");
  assert(summary.currentLanding === "/dashboard", "current landing");
  assert(summary.primaryShortcut === "/dashboard/command-center", "primary shortcut");
  assert(summary.commandCenterAvailable === true, "command center available");
  assert(summary.dashboardSections.length >= 2, "dashboard sections");
  assert(summary.dashboardSections.some((s) => s.href === "/dashboard/command-center"), "cc section");

  console.log("✓ shell summary structure");
  console.log(" ", summary.summary);
}

function testNavigationMapping() {
  const navigation = getDashboardShellNavigation();
  assert(navigation.version === DASHBOARD_SHELL_NAV_VERSION, "nav version");
  assert(navigation.links.length >= 7, "nav links");

  const dashToCc = navigation.links.find((l) => l.from === "/dashboard" && l.to === "/dashboard/command-center");
  assert(Boolean(dashToCc), "dashboard → command center mapping");

  const ccTargets = ["ops", "governance", "audit", "release", "access"];
  for (const keyword of ccTargets) {
    assert(
      navigation.links.some((l) => l.from === "/dashboard/command-center" && l.to.includes(keyword)),
      `command center → ${keyword} mapping`,
    );
  }

  console.log("✓ navigation mapping");
  console.log(" ", `links=${navigation.links.length}`);
}

function testCommandCenterAccessibleFromDashboard() {
  const foundation = buildDashboardShellFoundation({ deploymentId: "h16-foundation" });
  assert(foundation.version === PRODUCTION_DASHBOARD_SHELL_VERSION, "foundation version");
  assert(foundation.summary.commandCenterAvailable, "command center available");
  assert(foundation.navigation.links[0]?.to === "/dashboard/command-center", "first nav to command center");

  console.log("✓ command center accessible from dashboard shell");
  console.log(" ", foundation.foundationSummary);
}

function main() {
  testDashboardPageHasCommandCenterLink();
  testShellSummaryShape();
  testNavigationMapping();
  testCommandCenterAccessibleFromDashboard();
  console.log("\nAll dashboard shell checks passed.");
}

main();
