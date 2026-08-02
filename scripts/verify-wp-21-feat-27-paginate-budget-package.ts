/**
 * WP-21 / FEAT-27 — Paginate Budget Packages verification.
 * Pagination query → pagedResults / pageInfo / PAGINATED / paginationTime.
 */
import {
  clearListedBudgetPackages,
  FEAT_27_ID,
  generateBudgetPackage,
  PAGINATE_BUDGET_PACKAGE_CAPABILITY,
  paginateBudgetPackages,
  rememberExistingBudgetPackage,
  runBudgetEngine,
  toBudgetReadyState,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-21 FEAT-27 / Paginate Budget Packages ===");

  clearListedBudgetPackages();

  for (const suffix of ["c", "a", "b"]) {
    const engine = runBudgetEngine({
      quoteId: `quote-wp21-${suffix}`,
      workspaceId: "ws-wp21",
      companySize: 10,
      budgetTier: "mid",
    });
    const pkg = generateBudgetPackage(
      toBudgetReadyState(`budget-wp21-${suffix}`, engine),
    );
    rememberExistingBudgetPackage(pkg);
  }

  const page1 = paginateBudgetPackages({
    sortBy: "budgetId",
    sortDir: "asc",
    page: 1,
    pageSize: 2,
  });

  assert(page1.featId === FEAT_27_ID, "FEAT-27");
  assert(
    page1.capability === PAGINATE_BUDGET_PACKAGE_CAPABILITY,
    "PaginateBudgetPackages",
  );
  assert(page1.pagedResults.length === 2, "page1 size");
  assert(page1.paginationStatus === "PAGINATED", "PAGINATED");
  assert(
    typeof page1.paginationTime === "string" &&
      page1.paginationTime.includes("T"),
    "paginationTime",
  );
  assert(page1.pageInfo.page === 1, "page");
  assert(page1.pageInfo.pageSize === 2, "pageSize");
  assert(page1.pageInfo.totalItems === 3, "totalItems");
  assert(page1.pageInfo.totalPages === 2, "totalPages");
  assert(page1.pageInfo.hasNextPage === true, "hasNextPage");
  assert(page1.pageInfo.hasPreviousPage === false, "hasPreviousPage");
  assert(
    page1.pagedResults[0]?.budgetId === "budget-wp21-a",
    "sorted+paged first",
  );

  const page2 = paginateBudgetPackages({
    sortBy: "budgetId",
    sortDir: "asc",
    page: 2,
    pageSize: 2,
  });
  assert(page2.pagedResults.length === 1, "page2 size");
  assert(page2.pageInfo.hasNextPage === false, "page2 no next");
  assert(page2.pageInfo.hasPreviousPage === true, "page2 has prev");

  const filtered = paginateBudgetPackages({
    q: "budget-wp21-b",
    page: 1,
    pageSize: 10,
  });
  assert(filtered.pagedResults.length === 1, "reuses search");
  assert(filtered.pageInfo.totalItems === 1, "filtered total");

  console.log(
    "PASS Paginate Budget Packages → pagedResults / pageInfo / PAGINATED / paginationTime",
  );

  clearListedBudgetPackages();
  console.log("PASS FEAT-27 Paginate Budget Packages");
  console.log("WP-21 verification complete");
}

main();
