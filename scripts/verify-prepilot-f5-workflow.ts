/**
 * Target-user Pre-Pilot — F5 guided solution workflow verification (+ F5.1 session ack restore).
 * Pure derivation + static wiring checks. No DB, no network; storage is an in-memory stub.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { PRODUCT_CONTEXT_STORAGE_KEY } from "../app/(product)/commercial-context";
import {
  deriveQuoteWorkflowStage,
  isPanelReachable,
  isProductConfigConfirmed,
  isQuoteReady,
  QUOTE_WORKFLOW_ACK_MAX_RECORDS,
  QUOTE_WORKFLOW_ACK_STORAGE_KEY,
  QUOTE_WORKFLOW_STEPS,
  readWorkflowAck,
  requirementsNeedingAck,
  resolveActivePanel,
  restoredWorkflowAckQuoteIds,
  withExplicitTemplateConfirmations,
  writeWorkflowAck,
  type DeriveQuoteWorkflowStageInput,
  type PiLoadStatus,
  type WorkflowAckScope,
  type WorkflowAckStorage,
  type WorkflowFactsInput,
  type WorkflowPiFacts,
} from "../app/(product)/quote/quote-workflow";

const ROOT = path.resolve(__dirname, "..");
const QUOTE_PAGE = "app/(product)/quote/page.tsx";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function sliceBetween(src: string, start: string, end: string) {
  const from = src.indexOf(start);
  assert(from >= 0, `marker present: ${start}`);
  const to = src.indexOf(end, from + start.length);
  assert(to > from, `marker present after ${start}: ${end}`);
  return src.slice(from, to);
}

function stageInput(overrides: Partial<DeriveQuoteWorkflowStageInput> = {}): DeriveQuoteWorkflowStageInput {
  return {
    projectId: "p1",
    quoteId: "q1",
    piStatus: "success",
    piView: { quoteId: "q1", selections: [] },
    requirementsAckQuoteId: "",
    strategyAckQuoteId: "",
    ...overrides,
  };
}

const SAVED: WorkflowPiFacts = { quoteId: "q1", selections: [{ slotKey: "s1" }] };

function checkDerivationTruthTable() {
  const cases: Array<[string, Partial<DeriveQuoteWorkflowStageInput>, string]> = [
    ["no project", { projectId: "" }, "requirements"],
    ["no quote", { quoteId: "" }, "requirements"],
    ["whitespace quote", { quoteId: "   " }, "requirements"],
    ["PI idle", { piStatus: "idle", piView: null }, "confirmation"],
    ["PI loading", { piStatus: "loading", piView: null }, "confirmation"],
    ["PI error", { piStatus: "error", piView: null }, "confirmation"],
    ["PI success, no ack", {}, "confirmation"],
    ["requirements ack for other quote", { requirementsAckQuoteId: "q0" }, "confirmation"],
    ["requirements ack", { requirementsAckQuoteId: "q1" }, "strategy"],
    [
      "strategy ack for other quote",
      { requirementsAckQuoteId: "q1", strategyAckQuoteId: "q0" },
      "strategy",
    ],
    ["both acks", { requirementsAckQuoteId: "q1", strategyAckQuoteId: "q1" }, "products"],
    ["saved selections, no acks (refresh / grandfathered)", { piView: SAVED }, "ready_for_budget"],
    [
      "saved selections + acks",
      { piView: SAVED, requirementsAckQuoteId: "q1", strategyAckQuoteId: "q1" },
      "ready_for_budget",
    ],
    ["saved selections but PI loading", { piView: SAVED, piStatus: "loading" }, "confirmation"],
    [
      "stale PI view (other quote) with selections",
      { piView: { quoteId: "q0", selections: [{ slotKey: "s1" }] } },
      "confirmation",
    ],
    [
      "stale PI view + acks for current quote",
      {
        piView: { quoteId: "q0", selections: [{ slotKey: "s1" }] },
        requirementsAckQuoteId: "q1",
        strategyAckQuoteId: "q1",
      },
      "confirmation",
    ],
  ];
  for (const [label, overrides, expected] of cases) {
    const stage = deriveQuoteWorkflowStage(stageInput(overrides));
    assert(stage === expected, `${label}: expected ${expected}, got ${stage}`);
  }
  console.log(`✓ stage derivation truth table (${cases.length} cases)`);
}

function checkConfirmationFacts() {
  const facts = (piStatus: PiLoadStatus, piView: WorkflowPiFacts, quoteId = "q1") => ({
    quoteId,
    piStatus,
    piView,
  });

  assert(isQuoteReady(facts("success", { quoteId: "q1", selections: [] })), "matching PI is ready");
  assert(!isQuoteReady(facts("success", { quoteId: "q0", selections: [] })), "stale PI quoteId is not ready");
  assert(!isQuoteReady(facts("success", null)), "missing PI is not ready");
  assert(!isQuoteReady(facts("success", { quoteId: "", selections: [] }, "")), "empty quoteId is not ready");

  assert(isProductConfigConfirmed(facts("success", SAVED)), "saved selections confirm");
  assert(
    !isProductConfigConfirmed(facts("success", { quoteId: "q0", selections: [{ slotKey: "s1" }] })),
    "stale PI view cannot confirm",
  );
  assert(
    !isProductConfigConfirmed(facts("success", { quoteId: "q1", selections: [] })),
    "candidates alone (zero saved selections) cannot confirm",
  );
  for (const status of ["idle", "loading", "error"] as const) {
    assert(!isProductConfigConfirmed(facts(status, SAVED)), `PI ${status} cannot confirm`);
  }
  console.log("✓ confirmation facts (stale / candidates-only / zero / saved)");
}

function checkPanelNavigation() {
  assert(isPanelReachable("requirements", "confirmation"), "step 1 reachable from step 2");
  assert(!isPanelReachable("strategy", "confirmation"), "step 3 locked before requirements ack");
  assert(!isPanelReachable("products", "strategy"), "step 4 locked before strategy ack");
  assert(isPanelReachable("products", "ready_for_budget"), "step 4 reachable when confirmed");
  assert(isPanelReachable("strategy", "ready_for_budget"), "step 3 reviewable when confirmed");

  assert(resolveActivePanel("ready_for_budget", "q1", null) === "products", "confirmed defaults to products");
  assert(resolveActivePanel("strategy", "q1", null) === "strategy", "panel follows stage");
  assert(
    resolveActivePanel("products", "q1", { quoteId: "q1", panel: "requirements" }) === "requirements",
    "user may revisit an earlier panel",
  );
  assert(
    resolveActivePanel("confirmation", "q1", { quoteId: "q1", panel: "products" }) === "confirmation",
    "user cannot jump to a locked panel",
  );
  assert(
    resolveActivePanel("confirmation", "q2", { quoteId: "q1", panel: "requirements" }) === "confirmation",
    "cursor of another quote is ignored",
  );

  const keys = QUOTE_WORKFLOW_STEPS.map((s) => s.key).join(",");
  assert(
    keys === "requirements,confirmation,strategy,products,budget,delivery",
    "stepper order requirements → delivery",
  );
  console.log("✓ panel navigation + stepper");
}

function checkRequirementAck() {
  const items = [
    { id: "a", status: "MATCHED" },
    { id: "b", status: "NEEDS_CLARIFICATION" },
    { id: "c", status: "CONFLICT" },
    { id: "d", status: "NEW_SCOPE" },
    { id: "e", status: "CONDITIONAL" },
    { id: "f", status: "PARTIAL" },
  ];
  const ids = requirementsNeedingAck(items).map((i) => i.id).join(",");
  assert(ids === "b,c,d,e", `ack-required statuses filtered (got ${ids})`);
  console.log("✓ requirement acknowledgement filter");
}

function checkExplicitTemplateConfirmations() {
  const slots = [{ slotKey: "s1" }, { slotKey: "s2" }, { slotKey: "s3" }];
  const allTemplate = withExplicitTemplateConfirmations(slots, []);
  assert(allTemplate.length === 3, "all-template → one entry per slot");
  for (const row of allTemplate) {
    assert(
      row.action === "confirm" && "candidateId" in row && row.candidateId === null,
      `all-template slot ${row.slotKey} → confirm/null`,
    );
  }

  const diff = [
    { slotKey: "s2", action: "replace" as const, candidateId: "c-9" },
    { slotKey: "s3", action: "remove" as const },
  ];
  const mixed = withExplicitTemplateConfirmations(slots, diff);
  assert(mixed.map((r) => r.slotKey).join(",") === "s1,s2,s3", "slot order kept");
  assert(mixed[0].action === "confirm" && (mixed[0] as { candidateId: unknown }).candidateId === null, "untouched slot confirmed as template");
  assert(mixed[1] === diff[0] && mixed[2] === diff[1], "changed slots pass through unchanged");

  assert(withExplicitTemplateConfirmations([], []).length === 0, "zero slots → empty payload");
  console.log("✓ explicit template confirmations");
}

function checkPageWorkflowWiring() {
  const src = read(QUOTE_PAGE);

  const workflowSetters = [
    'setPiStatus("idle")',
    'setRequirementsAckQuoteId("")',
    'setRequirementsAckCheckedQuoteId("")',
    'setStrategyAckQuoteId("")',
    "setViewPanel(null)",
  ];
  const clearBody = sliceBetween(src, "function clearWorkflowUiState", "function resetProjectScopedState");
  const resetBody = sliceBetween(src, "function resetProjectScopedState", "function discardMismatchedQuote");
  for (const setter of workflowSetters) {
    assert(clearBody.includes(setter), `clearWorkflowUiState clears ${setter}`);
    assert(resetBody.includes(setter), `resetProjectScopedState clears ${setter}`);
  }
  const discardBody = sliceBetween(src, "function discardMismatchedQuote", "router.replace(");
  assert(discardBody.includes("clearWorkflowUiState()"), "mismatch discard clears F5 state");

  const generateBody = sliceBetween(src, "if (readyProposal && nextQuoteId) {", "} else {");
  for (const token of [
    "setPiView(null)",
    "setSlotDrafts({})",
    'setInitialSelectionJson("[]")',
    "clearWorkflowUiState()",
    "router.replace(",
    'productHref("/quote"',
    "quoteId: nextQuoteId",
  ]) {
    assert(generateBody.includes(token), `new READY quote: ${token}`);
  }
  assert(src.includes("不会带入这些选择"), "revision warning kept");

  for (const token of ["requirementsAck", "strategyAck", "viewPanel", "piStatus"]) {
    const storageWrite = new RegExp(`writeStored\\w*\\([^)]*${token}`);
    assert(!storageWrite.test(src), `${token} never written via product-context storage helpers`);
  }
  assert(!src.includes("localStorage"), "quote page never uses localStorage");
  const sessionWrites = src.match(/sessionStorage\.setItem\(/g) ?? [];
  const writeOwners = [...src.matchAll(/sessionStorage\.setItem\((\w+)/g)].map((m) => m[1]);
  assert(
    sessionWrites.length === writeOwners.length &&
      writeOwners.every((key) => key === "QUOTE_BY_PROJECT_STORAGE_KEY" || key === "QUOTE_PROPOSAL_KEY"),
    "page writes no workflow ack via raw sessionStorage.setItem",
  );
  const ackWrites = [...src.matchAll(/writeWorkflowAck\(\s*window\.sessionStorage/g)].length;
  assert(ackWrites === 1, "acknowledgement written only through writeWorkflowAck(window.sessionStorage, …)");
  assert(
    QUOTE_WORKFLOW_ACK_STORAGE_KEY !== PRODUCT_CONTEXT_STORAGE_KEY,
    "dedicated ack key differs from product-commercial-context",
  );
  const ctx = read("app/(product)/commercial-context.ts");
  for (const token of ["requirementsAck", "strategyAck", "viewPanel", "workflow"]) {
    assert(!ctx.includes(token), `product-commercial-context has no ${token}`);
  }

  assert(!src.includes("handleSaveSelections"), "old save handler removed");
  assert(src.includes("handleConfirmProductConfiguration"), "confirm handler present");
  assert(src.includes('"确认产品配置"'), "primary action 确认产品配置");
  const confirmBody = sliceBetween(src, "async function handleConfirmProductConfiguration", "setPiSaving(true)");
  assert(
    confirmBody.includes("piView.quoteId !== baseQuoteId") && confirmBody.includes("piView.slots.length === 0"),
    "confirm requires current-quote PI and at least one slot",
  );
  assert(
    confirmBody.includes("withExplicitTemplateConfirmations(piView.slots, selectionPayload)"),
    "confirm sends every slot explicitly",
  );
  assert(
    src.includes("当前方案暂无可确认的设备配置，请调整需求或重新生成方案。"),
    "zero-slot fail-closed message",
  );

  for (const label of [
    "第 1 步：项目需求",
    "第 2 步：AI 需求确认",
    "第 3 步：方案策略",
    "第 4 步：产品配置",
    "第 5 步：预算",
    "提交需求并生成方案",
    "确认以上识别结果，继续方案策略",
    "按补充要求修改",
    "确认方案策略，继续产品配置",
  ]) {
    assert(src.includes(label), `UI label present: ${label}`);
  }
  assert(!src.includes("方案已就绪。主要下一步：继续生成预算"), "premature budget copy removed");
  console.log("✓ quote page workflow wiring (reset / discard / revision / confirm)");
}

function checkBudgetGate() {
  const src = read(QUOTE_PAGE);
  const gateOpen = "{currentQuoteId && productConfigConfirmed ? (";
  const gateLocked = ") : currentQuoteId ? (";
  const openIdx = src.indexOf(gateOpen);
  const lockedIdx = src.indexOf(gateLocked, openIdx);
  assert(openIdx > 0 && lockedIdx > openIdx, "budget section gated by productConfigConfirmed");

  const budgetLinks: number[] = [];
  for (let i = src.indexOf('productHref("/budget"'); i >= 0; i = src.indexOf('productHref("/budget"', i + 1)) {
    budgetLinks.push(i);
  }
  assert(budgetLinks.length > 0, "budget links present");
  for (const idx of budgetLinks) {
    assert(idx > openIdx && idx < lockedIdx, "every budget link sits inside the confirmed section");
  }

  const ctaIdx: number[] = [];
  for (let i = src.indexOf("<ProUpgradePaymentCta"); i >= 0; i = src.indexOf("<ProUpgradePaymentCta", i + 1)) {
    ctaIdx.push(i);
  }
  assert(ctaIdx.length === 3, "three PRO CTAs (top gate + two budget-section)");
  assert(ctaIdx[0] < openIdx, "top PRO gate unchanged (outside workflow gate)");
  assert(ctaIdx[1] > openIdx && ctaIdx[2] < lockedIdx, "inline CTAs only inside confirmed budget section");

  const section = src.slice(openIdx, lockedIdx);
  for (const token of [
    "budgetEntitled ? (",
    'budgetEntitlement !== "upgradeable" ?',
    "showImmediateProPayGate ? (",
    "pdfDownloaded && budgetEntitled ?",
    'pdfDownloaded && budgetEntitlement === "upgradeable"',
    "继续生成预算",
  ]) {
    assert(section.includes(token), `F3 branch kept in budget section: ${token}`);
  }
  const locked = src.slice(lockedIdx, src.indexOf(") : null}", lockedIdx));
  assert(locked.includes("第 5 步：预算（未解锁）"), "locked budget step shown");
  assert(!locked.includes('productHref("/budget"'), "locked step has no budget link");
  console.log("✓ budget CTA gate (current quote + saved selections, F3 branches unchanged)");
}

function checkConfigurationStrategyReadOnly() {
  const svc = read("lib/services/quote.service.ts");
  const body = sliceBetween(svc, "export async function getQuoteProductIntelligence", "\n}\n");
  assert(body.includes("content?.configurationStrategy"), "PI view reads persisted configurationStrategy");
  assert(body.includes("readStoredConfigurationAnalysis("), "PI view uses read-only parser");
  for (const forbidden of [".update(", ".create(", ".upsert(", "generateQuote(", "analyzeConfigurationStrategy("]) {
    assert(!body.includes(forbidden), `getQuoteProductIntelligence does not call ${forbidden}`);
  }
  const route = read("app/api/quote/product-intelligence/route.ts");
  assert(route.includes("...view"), "PI GET spreads the service view (configurationStrategy passes through)");
  console.log("✓ configurationStrategy exposure is read-only (static)");
}

async function checkReadStoredConfigurationAnalysisRuntime() {
  process.env.DATABASE_URL ??= "postgresql://verify:verify@127.0.0.1:5432/verify";
  const { readStoredConfigurationAnalysis } = await import("../lib/services/quote.service");
  const { CONFIGURATION_STRATEGY_VERSION } = await import("../lib/product-engine/configuration-strategy");

  assert(readStoredConfigurationAnalysis(null) === null, "null → null");
  assert(readStoredConfigurationAnalysis("x") === null, "string → null");
  assert(
    readStoredConfigurationAnalysis({ version: "old", configurationStrategy: {} }) === null,
    "other version → null",
  );
  assert(
    readStoredConfigurationAnalysis({ version: CONFIGURATION_STRATEGY_VERSION }) === null,
    "missing strategy → null",
  );

  const stored = Object.freeze({
    version: CONFIGURATION_STRATEGY_VERSION,
    analyzedAt: "2026-09-30T00:00:00.000Z",
    missingCriticalInfo: Object.freeze([{ key: "area", label: "面积" }]),
    configurationStrategy: Object.freeze({ guidance: Object.freeze(["g1"]) }),
  });
  const parsed = readStoredConfigurationAnalysis(stored);
  assert(parsed !== null && parsed.version === CONFIGURATION_STRATEGY_VERSION, "valid analysis parsed");
  assert(parsed!.configurationStrategy === stored.configurationStrategy, "strategy returned as stored");
  assert(parsed!.missingCriticalInfo.length === 1, "missingCriticalInfo kept");

  const partial = readStoredConfigurationAnalysis({
    version: CONFIGURATION_STRATEGY_VERSION,
    configurationStrategy: {},
  });
  assert(partial !== null && partial.analyzedAt === "" && partial.missingCriticalInfo.length === 0, "defaults for partial row");
  console.log("✓ readStoredConfigurationAnalysis runtime (frozen input, no mutation)");
}

function checkProtectedFilesUntouched() {
  const changed = execSync("git diff --name-only HEAD", { cwd: ROOT, encoding: "utf8" })
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
  ]);
  const forbidden = [
    /^prisma\//,
    /tender/i,
    /enterprise/i,
    /^lib\/product-engine\//,
    /^lib\/services\/budget/,
    /^app\/\(product\)\/budget\//,
    /^app\/api\/budget\//,
    /^app\/api\/pay\//,
    /^app\/api\/upgrade\//,
    /^lib\/payments\//,
    /^lib\/billing\//,
    /^lib\/auth\//,
    /^lib\/commercial\/proPurchaseEligibility/,
    /^app\/\(product\)\/commercial-context/,
  ];
  for (const file of changed) {
    if (knownDirty.has(file)) continue;
    for (const re of forbidden) {
      assert(!re.test(file), `protected file changed: ${file}`);
    }
  }
  console.log("✓ protected files untouched (schema / PI engine / budget / pay / tender / enterprise / F3-F4)");
}

function memoryStorage(): WorkflowAckStorage & { dump: () => Record<string, string> } {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    dump: () => Object.fromEntries(map),
  };
}

function stageAfterRefresh(
  storage: WorkflowAckStorage,
  scope: WorkflowAckScope,
  facts: WorkflowFactsInput,
) {
  const restored = restoredWorkflowAckQuoteIds({
    scope,
    facts,
    record: readWorkflowAck(storage, scope),
  });
  return deriveQuoteWorkflowStage({ projectId: scope.projectId, ...facts, ...restored });
}

function checkSessionAckRestore() {
  const scope: WorkflowAckScope = { userId: "u1", projectId: "p1", quoteId: "q1" };
  const ready: WorkflowFactsInput = {
    quoteId: "q1",
    piStatus: "success",
    piView: { quoteId: "q1", selections: [] },
  };

  const storage = memoryStorage();
  assert(stageAfterRefresh(storage, scope, ready) === "confirmation", "no record → Step 2");

  writeWorkflowAck(storage, scope, { requirementsAck: true }, 1);
  assert(stageAfterRefresh(storage, scope, ready) === "strategy", "Step 2 ack + refresh → Step 3");
  writeWorkflowAck(storage, scope, { strategyAck: true }, 2);
  assert(stageAfterRefresh(storage, scope, ready) === "products", "Step 2 + Step 3 ack + refresh → Step 4");

  const nextQuote = { ...scope, quoteId: "q2" };
  const nextReady: WorkflowFactsInput = { quoteId: "q2", piStatus: "success", piView: { quoteId: "q2", selections: [] } };
  assert(stageAfterRefresh(storage, nextQuote, nextReady) === "confirmation", "new quoteId (revision) → Step 2");
  assert(
    stageAfterRefresh(storage, { ...scope, projectId: "p2" }, ready) === "confirmation",
    "different project → no restore",
  );
  assert(
    stageAfterRefresh(storage, { ...scope, userId: "u2" }, ready) === "confirmation",
    "different user → no restore",
  );
  assert(
    stageAfterRefresh(storage, { ...scope, userId: "" }, ready) === "confirmation",
    "unknown user → no restore",
  );

  for (const piStatus of ["idle", "loading", "error"] as const) {
    const facts: WorkflowFactsInput = { ...ready, piStatus, piView: piStatus === "error" ? null : ready.piView };
    const restored = restoredWorkflowAckQuoteIds({ scope, facts, record: readWorkflowAck(storage, scope) });
    assert(
      !restored.requirementsAckQuoteId && !restored.strategyAckQuoteId,
      `PI ${piStatus} → no premature restore`,
    );
    assert(stageAfterRefresh(storage, scope, facts) === "confirmation", `PI ${piStatus} → Steps 3/4 hidden`);
  }
  const stale: WorkflowFactsInput = { quoteId: "q1", piStatus: "success", piView: { quoteId: "q0", selections: [] } };
  assert(stageAfterRefresh(storage, scope, stale) === "confirmation", "stale PI view → no restore");
  const mismatchedFacts = restoredWorkflowAckQuoteIds({
    scope,
    facts: nextReady,
    record: { requirementsAck: true, strategyAck: true },
  });
  assert(!mismatchedFacts.requirementsAckQuoteId, "record of one quote never applies to another quote's facts");

  const strategyOnly = memoryStorage();
  writeWorkflowAck(strategyOnly, scope, { strategyAck: true }, 1);
  assert(stageAfterRefresh(strategyOnly, scope, ready) === "confirmation", "strategy ack alone never skips Step 2");

  const saved: WorkflowFactsInput = {
    quoteId: "q1",
    piStatus: "success",
    piView: { quoteId: "q1", selections: [{ slotKey: "s1" }] },
  };
  assert(stageAfterRefresh(memoryStorage(), scope, saved) === "ready_for_budget", "saved selections → ready_for_budget without acks");
  assert(
    stageAfterRefresh(memoryStorage(), nextQuote, nextReady) === "confirmation",
    "budget unlock still requires persisted selections (ack alone never unlocks)",
  );
  assert(!isProductConfigConfirmed(ready), "acks never count as product configuration");

  const raw = JSON.parse(storage.dump()[QUOTE_WORKFLOW_ACK_STORAGE_KEY]) as Record<string, Record<string, unknown>>;
  assert(!(PRODUCT_CONTEXT_STORAGE_KEY in storage.dump()), "ack never written to product-commercial-context key");
  for (const row of Object.values(raw)) {
    assert(
      Object.keys(row).sort().join(",") === "at,requirementsAck,strategyAck",
      "record stores only requirementsAck / strategyAck / at",
    );
  }

  const bounded = memoryStorage();
  for (let i = 0; i < QUOTE_WORKFLOW_ACK_MAX_RECORDS + 10; i++) {
    writeWorkflowAck(bounded, { userId: "u1", projectId: "p1", quoteId: `q${i}` }, { requirementsAck: true }, i);
  }
  const kept = JSON.parse(bounded.dump()[QUOTE_WORKFLOW_ACK_STORAGE_KEY]) as Record<string, unknown>;
  assert(Object.keys(kept).length === QUOTE_WORKFLOW_ACK_MAX_RECORDS, "at most 50 records retained");
  assert(
    readWorkflowAck(bounded, { userId: "u1", projectId: "p1", quoteId: "q0" }).requirementsAck === false &&
      readWorkflowAck(bounded, { userId: "u1", projectId: "p1", quoteId: `q${QUOTE_WORKFLOW_ACK_MAX_RECORDS + 9}` })
        .requirementsAck === true,
    "oldest records pruned first",
  );

  const corrupt = memoryStorage();
  corrupt.setItem(QUOTE_WORKFLOW_ACK_STORAGE_KEY, "{not json");
  assert(readWorkflowAck(corrupt, scope).requirementsAck === false, "corrupt storage → no restore, no throw");
  const throwing: WorkflowAckStorage = {
    getItem: () => null,
    setItem: () => {
      throw new Error("QuotaExceeded");
    },
  };
  writeWorkflowAck(throwing, scope, { requirementsAck: true });
  console.log("✓ F5.1 session ack restore (user/project/quote isolation, PI-ready gate, bounded)");
}

function checkSessionAckWiring() {
  const src = read(QUOTE_PAGE);
  const restoreEffect = sliceBetween(src, "const scope = { userId: sessionUserId", "}, [sessionUserId, projectId, quoteId, piStatus, piView]);");
  assert(restoreEffect.includes("if (!isQuoteReady(facts)) return;"), "restore waits for PI success on current quote");
  assert(restoreEffect.includes("readWorkflowAck(window.sessionStorage, scope)"), "restore reads dedicated session store");
  assert(!restoreEffect.includes("setRequirementsAckCheckedQuoteId"), "checkbox state is never restored as a fact");

  const reqAck = sliceBetween(src, "function handleAcknowledgeRequirements", "function handleAcknowledgeStrategy");
  assert(reqAck.includes("persistWorkflowAck({ requirementsAck: true })"), "Step 2 confirmation persists requirementsAck");
  const strategyAck = sliceBetween(src, "function handleAcknowledgeStrategy", "const headerCopy");
  assert(strategyAck.includes("persistWorkflowAck({ strategyAck: true })"), "Step 3 confirmation persists strategyAck");
  const persist = sliceBetween(src, "function persistWorkflowAck", "function handleAcknowledgeRequirements");
  assert(
    persist.includes("{ userId: sessionUserId, projectId, quoteId: currentQuoteId }"),
    "write scoped to exact userId + projectId + quoteId",
  );
  assert(src.includes("setSessionUserId(userId)"), "userId comes from the authenticated session (/api/auth/me)");

  const generateBody = sliceBetween(src, "if (readyProposal && nextQuoteId) {", "} else {");
  assert(!generateBody.includes("writeWorkflowAck") && !generateBody.includes("persistWorkflowAck"), "revision never copies acks");
  assert(src.includes("requirementsToAck.length > 0 && !requirementsAcknowledged ?"), "checkbox hidden once acknowledged");
  console.log("✓ F5.1 page wiring (restore after PI ready, scoped writes, no revision copy)");
}

async function main() {
  checkDerivationTruthTable();
  checkConfirmationFacts();
  checkPanelNavigation();
  checkRequirementAck();
  checkExplicitTemplateConfirmations();
  checkSessionAckRestore();
  checkSessionAckWiring();
  checkPageWorkflowWiring();
  checkBudgetGate();
  checkConfigurationStrategyReadOnly();
  await checkReadStoredConfigurationAnalysisRuntime();
  checkProtectedFilesUntouched();
  console.log("\nverify-prepilot-f5-workflow: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
