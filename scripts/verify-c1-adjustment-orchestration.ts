/**
 * C.1 hotfix — Over-Budget Adjustment browser orchestration verification.
 * Shared submit eligibility (button === handler), persistence-verified Quote switch,
 * POST / verification / recalculation failure handling, and the Production 9 → 8 scenario
 * end to end through the real quote/budget services (in-memory Prisma stub) and the real
 * product-context storage helpers (in-memory sessionStorage). No DB, no network, no files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

import type { BudgetItem } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
const BUDGET_PAGE = "app/(product)/budget/page.tsx";
const FLOW_LIB = "lib/budget/over-budget-adjustment-flow.ts";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function json(value: unknown) {
  return JSON.stringify(value);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function sliceBetween(src: string, start: string, end: string) {
  const a = src.indexOf(start);
  const b = src.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `locate ${start}`);
  return src.slice(a, b);
}

// ---------------------------------------------------------------------------
// In-memory Prisma stub + sessionStorage
// ---------------------------------------------------------------------------

type Row = Record<string, unknown> & { id: string };

const db = {
  projects: new Map<string, Row>(),
  quotes: new Map<string, Row>(),
  budgets: [] as Row[],
  seq: 0,
};

function stubModule(rel: string, exports: Record<string, unknown>) {
  const filename = require.resolve(path.join(ROOT, rel));
  const mod = new Module(filename);
  mod.filename = filename;
  mod.loaded = true;
  mod.exports = exports;
  require.cache[filename] = mod;
}

stubModule("lib/prisma", {
  prisma: {
    project: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        const row = db.projects.get(where.id);
        return row ? structuredClone(row) : null;
      },
    },
    quote: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row: Row = {
          id: `q-new-${++db.seq}`,
          content: null,
          orchestrationId: null,
          createdAt: new Date(),
          ...structuredClone(data),
        };
        db.quotes.set(row.id, row);
        return structuredClone(row);
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = db.quotes.get(where.id);
        if (!row) throw new Error(`quote ${where.id} not found`);
        Object.assign(row, structuredClone(data));
        return structuredClone(row);
      },
      findUnique: async ({
        where,
        include,
      }: {
        where: { id: string };
        include?: { project?: boolean };
      }) => {
        const row = db.quotes.get(where.id);
        if (!row) return null;
        const out = structuredClone(row) as Row & { project?: Row };
        if (include?.project) {
          const project = db.projects.get(String(row.projectId));
          out.project = project ? structuredClone(project) : undefined;
        }
        return out;
      },
    },
    budget: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row: Row = { id: `b-${++db.seq}`, createdAt: new Date(), ...structuredClone(data) };
        db.budgets.push(row);
        return structuredClone(row);
      },
    },
  },
});

const storage = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  sessionStorage: {
    getItem: (k: string) => (storage.has(k) ? storage.get(k)! : null),
    setItem: (k: string, v: string) => void storage.set(k, String(v)),
    removeItem: (k: string) => void storage.delete(k),
  },
};

/* eslint-disable @typescript-eslint/no-require-imports */
const flow = require("../lib/budget/over-budget-adjustment-flow") as typeof import("../lib/budget/over-budget-adjustment-flow");
const adjustment = require("../lib/budget/over-budget-adjustment") as typeof import("../lib/budget/over-budget-adjustment");
const cc = require("../app/(product)/commercial-context") as typeof import("../app/(product)/commercial-context");
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
/* eslint-enable @typescript-eslint/no-require-imports */

type SubmitInput = import("../lib/budget/over-budget-adjustment-flow").AdjustmentSubmitInput;
type Effects = import("../lib/budget/over-budget-adjustment-flow").AdjustmentApplyEffects;
type Snapshot = import("../lib/budget/over-budget-adjustment-flow").PersistedQuoteSnapshot;
type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;

const ORG = "org-c1o";
const PROJECT = "p-c1o";
const OLD_QUOTE = "cmuseth1z0006pby2y1h990ej";
const OLD_BUDGET = "cmusexh94000apby2tq3hxypz";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
const PRICE_FACT = {
  unitPrice: 50000,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C1O-001",
  quotedAt: "2026-09-20",
  supplier: "上海测试器材供应商",
  taxStatus: "tax_included",
  validUntil: "2026-12-31",
};

// ---------------------------------------------------------------------------
// Page model: the active binding the Budget page exposes (state + URL + storage)
// ---------------------------------------------------------------------------

type PageModel = {
  quoteId: string;
  projectId: string;
  budgetId: string;
  budgetSummary: { min: number; max: number } | null;
  drafts: Record<string, string>;
  url: string;
  notice: string;
  warning: string;
  error: string;
};

function openPage(quoteId: string, budgetId: string, summary: { min: number; max: number }): PageModel {
  storage.clear();
  cc.writeStoredProductContext({ organizationId: ORG, projectId: PROJECT, quoteId, budgetId }, { mode: "replace" });
  cc.writeStoredQuoteIdForProject(PROJECT, quoteId);
  return {
    quoteId,
    projectId: PROJECT,
    budgetId,
    budgetSummary: summary,
    drafts: { [ELLIPTICAL_SLOT]: "8" },
    url: cc.productHref("/budget", { organizationId: ORG, projectId: PROJECT, quoteId, budgetId }),
    notice: "",
    warning: "",
    error: "",
  };
}

/** Mirrors the page's commitVerifiedQuote block (asserted statement by statement in checkPageWiring). */
function commitInto(page: PageModel) {
  return (nextQuoteId: string, boundProjectId: string) => {
    page.quoteId = nextQuoteId;
    page.projectId = boundProjectId;
    page.budgetId = "";
    page.budgetSummary = null;
    page.drafts = {};
    cc.writeStoredProductContext(
      { organizationId: ORG, projectId: boundProjectId, quoteId: nextQuoteId },
      { mode: "replace" },
    );
    cc.writeStoredQuoteIdForProject(boundProjectId, nextQuoteId);
    page.url = cc.productHref("/budget", { organizationId: ORG, projectId: boundProjectId, quoteId: nextQuoteId });
  };
}

function applyMessages(page: PageModel, outcome: Awaited<ReturnType<typeof flow.runAdjustmentApply>>) {
  const m = flow.adjustmentOutcomeMessages(outcome);
  page.notice = m.notice;
  page.warning = m.warning;
  page.error = m.error;
}

function bindingOf(page: PageModel) {
  const params = new URLSearchParams(page.url.split("?")[1] ?? "");
  return {
    active: page.quoteId,
    url: params.get("quoteId"),
    urlBudgetId: params.get("budgetId"),
    context: cc.readStoredProductContext(),
    mapping: cc.readStoredQuoteIdForProject(PROJECT),
  };
}

function assertUnchanged(page: PageModel, label: string) {
  const b = bindingOf(page);
  assert(
    b.active === OLD_QUOTE && b.url === OLD_QUOTE && b.urlBudgetId === OLD_BUDGET &&
      b.context.quoteId === OLD_QUOTE && b.context.budgetId === OLD_BUDGET && b.mapping === OLD_QUOTE,
    `${label}: active quoteId / URL / context / mapping unchanged`,
  );
  assert(page.budgetId === OLD_BUDGET && page.budgetSummary?.min === 685000, `${label}: current Budget untouched`);
  assert(page.drafts[ELLIPTICAL_SLOT] === "8", `${label}: draft retained (as unsaved preview)`);
  assert(page.notice === "" && page.warning === "", `${label}: no success notice`);
  assert(page.error.length > 0, `${label}: visible actionable error`);
}

function recordingEffects(
  page: PageModel,
  overrides: Partial<Effects>,
): { effects: Effects; log: string[] } {
  const log: string[] = [];
  const commit = commitInto(page);
  const save = overrides.saveNewVersion ?? (async () => ({ status: 200, nextQuoteId: "q-v2", projectId: PROJECT, message: "" }));
  const readBack =
    overrides.readPersistedSnapshot ??
    (async (id: string) => ({
      quoteId: id,
      selections: [{ slotKey: ELLIPTICAL_SLOT, action: "replace", candidate: null, quantity: 8, decidedAt: "" } as Selection],
    }));
  const recalc = overrides.recalculate ?? (async () => true);
  const effects: Effects = {
    approved: { [ELLIPTICAL_SLOT]: 8 },
    saveNewVersion: () => {
      log.push("save");
      return save();
    },
    readPersistedSnapshot: (id, projectId) => {
      log.push(`read:${id}:${projectId}`);
      return readBack(id, projectId);
    },
    commitVerifiedQuote: (id, projectId) => {
      log.push(`commit:${id}`);
      commit(id, projectId);
    },
    recalculate: (id) => {
      log.push(`recalc:${id}`);
      return recalc(id);
    },
  };
  return { effects, log };
}

// ---------------------------------------------------------------------------
// A. Shared submit eligibility
// ---------------------------------------------------------------------------

const READY_STATE: SubmitInput = {
  quoteId: OLD_QUOTE,
  organizationId: ORG,
  projectId: PROJECT,
  budgetDetailQuoteId: OLD_QUOTE,
  piSnapshotQuoteId: OLD_QUOTE,
  optionCount: 4,
  approvedOk: true,
  approvedCount: 1,
  loading: false,
  applying: false,
};

function checkEligibility() {
  assert(flow.resolveAdjustmentSubmitState(READY_STATE).ok, "A. Production state (cmuseth1, 9 → 8 drafted) is submittable");

  const blockers: Array<[string, Partial<SubmitInput>]> = [
    ["applying", { applying: true }],
    ["loading", { loading: true }],
    ["organization cleared by a failed recalculation", { organizationId: "" }],
    ["project missing", { projectId: "" }],
    ["quote missing", { quoteId: "" }],
    ["budget detail of another quote", { budgetDetailQuoteId: "q-other" }],
    ["PI snapshot of another quote", { piSnapshotQuoteId: "q-other" }],
    ["PI snapshot missing", { piSnapshotQuoteId: null }],
    ["no options", { optionCount: 0 }],
    ["invalid drafts", { approvedOk: false, approvedCount: 0 }],
    ["no drafts", { approvedCount: 0 }],
  ];
  for (const [label, patch] of blockers) {
    const state = flow.resolveAdjustmentSubmitState({ ...READY_STATE, ...patch });
    assert(!state.ok && state.reason.trim().length > 0, `A. ${label}: not submittable, with a visible reason`);
  }

  // Exhaustive: every combination yields either ok or a non-empty reason (no silent state).
  const flags = ["organizationId", "projectId", "budgetDetailQuoteId", "piSnapshotQuoteId", "loading", "applying", "approvedOk"] as const;
  for (let mask = 0; mask < 1 << flags.length; mask++) {
    const state: SubmitInput = { ...READY_STATE };
    flags.forEach((flag, i) => {
      if (!(mask & (1 << i))) return;
      if (flag === "loading" || flag === "applying") state[flag] = true;
      else if (flag === "approvedOk") state.approvedOk = false;
      else if (flag === "budgetDetailQuoteId" || flag === "piSnapshotQuoteId") state[flag] = null;
      else state[flag] = "";
    });
    const result = flow.resolveAdjustmentSubmitState(state);
    assert(result.ok === (mask === 0), `A. eligibility combination ${mask} resolves deterministically`);
    if (!result.ok) assert(result.reason.length > 0, `A. combination ${mask} has a reason`);
  }
  console.log("✓ A. one submit-eligibility result; every non-submittable state carries a visible reason");
}

// ---------------------------------------------------------------------------
// B–E. Orchestration with stubbed IO
// ---------------------------------------------------------------------------

async function checkSuccess() {
  const page = openPage(OLD_QUOTE, OLD_BUDGET, { min: 685000, max: 949000 });
  let bindingAtRecalc: ReturnType<typeof bindingOf> | null = null;
  const { effects, log } = recordingEffects(page, {
    recalculate: async () => {
      bindingAtRecalc = bindingOf(page);
      return true;
    },
  });
  const outcome = await flow.runAdjustmentApply(effects);
  applyMessages(page, outcome);
  assert(outcome.stage === "done" && outcome.quoteId === "q-v2", "B. outcome done with the new quoteId");
  assert(json(log) === json(["save", `read:q-v2:${PROJECT}`, "commit:q-v2", "recalc:q-v2"]), "B. save → verify (GET new id) → commit → recalculate(new id)");
  const b = bindingOf(page);
  assert(
    b.active === "q-v2" && b.url === "q-v2" && b.context.quoteId === "q-v2" && b.mapping === "q-v2",
    "B. active quoteId / URL / context / project mapping converge on the new quoteId",
  );
  assert(b.urlBudgetId == null && b.context.budgetId == null && page.budgetId === "", "B. old budgetId removed from URL, context and state");
  assert(bindingAtRecalc !== null && (bindingAtRecalc as ReturnType<typeof bindingOf>).url === "q-v2", "B. URL already on the new quoteId when recalculation starts");
  assert(page.notice.length > 0 && page.warning === "" && page.error === "", "B. success reported only after persistence + recalculation");
  console.log("✓ B. verified persistence → single convergent switch → recalculation on the new quoteId");
}

async function checkPostFailures() {
  const cases: Array<[string, Partial<Effects>, string]> = [
    ["400", { saveNewVersion: async () => ({ status: 400, nextQuoteId: "", projectId: PROJECT, message: "价格事实无效" }) }, "价格事实无效"],
    ["403", { saveNewVersion: async () => ({ status: 403, nextQuoteId: "", projectId: PROJECT, message: "Usage limit reached for QUOTE (10/10)" }) }, "Usage limit reached"],
    ["429", { saveNewVersion: async () => ({ status: 429, nextQuoteId: "", projectId: PROJECT, message: "" }) }, "频繁"],
    ["500", { saveNewVersion: async () => ({ status: 500, nextQuoteId: "", projectId: PROJECT, message: "boom" }) }, "500"],
    ["200 not READY", { saveNewVersion: async () => ({ status: 200, nextQuoteId: "", projectId: PROJECT, message: "" }) }, "未返回可用的新方案版本"],
    ["network", { saveNewVersion: async () => { throw new TypeError("Failed to fetch"); } }, "网络异常"],
  ];
  for (const [label, overrides, expected] of cases) {
    const page = openPage(OLD_QUOTE, OLD_BUDGET, { min: 685000, max: 949000 });
    const { effects, log } = recordingEffects(page, overrides);
    const outcome = await flow.runAdjustmentApply(effects);
    applyMessages(page, outcome);
    assert(outcome.stage === "save_failed", `C. ${label}: save_failed`);
    assert(json(log) === json(["save"]), `C. ${label}: no verification, no switch, no recalculation`);
    assert(page.error.includes(expected) && page.error.includes("当前方案未改变"), `C. ${label}: actionable error (${page.error})`);
    assertUnchanged(page, `C. ${label}`);
  }
  console.log("✓ C. 400 / 403 / 429 / 500 / not-READY / network: no switch, no success, visible error, draft kept unsaved");
}

async function checkVerificationMismatch() {
  const stored = (quantity: number | undefined, action: Selection["action"] = "replace"): Selection[] => [
    { slotKey: ELLIPTICAL_SLOT, action, candidate: null, ...(quantity != null ? { quantity } : {}), decidedAt: "" },
  ];
  const cases: Array<[string, Snapshot | null | "throw"]> = [
    ["stored quantity 9", { quoteId: "q-v2", selections: stored(9) }],
    ["quantity missing", { quoteId: "q-v2", selections: stored(undefined) }],
    ["slot removed", { quoteId: "q-v2", selections: stored(undefined, "remove") }],
    ["slot absent", { quoteId: "q-v2", selections: [] }],
    ["other quote returned", { quoteId: OLD_QUOTE, selections: stored(8) }],
    ["GET failed", null],
    ["GET threw", "throw"],
  ];
  for (const [label, snapshot] of cases) {
    const page = openPage(OLD_QUOTE, OLD_BUDGET, { min: 685000, max: 949000 });
    const { effects, log } = recordingEffects(page, {
      readPersistedSnapshot: async () => {
        if (snapshot === "throw") throw new Error("network");
        return snapshot;
      },
    });
    const outcome = await flow.runAdjustmentApply(effects);
    applyMessages(page, outcome);
    assert(outcome.stage === "verify_failed", `D. ${label}: verify_failed`);
    assert(json(log) === json(["save", `read:q-v2:${PROJECT}`]), `D. ${label}: no switch, no recalculation`);
    assert(page.error.includes("当前方案未切换"), `D. ${label}: visible error`);
    assertUnchanged(page, `D. ${label}`);
  }
  console.log("✓ D. persisted quantity ≠ approved (or unreadable): active Quote not switched, visible error");
}

async function checkRecalculationFailure() {
  for (const [label, recalculate] of [
    ["returns false", async () => false],
    ["throws", async () => { throw new Error("calc"); }],
  ] as const) {
    const page = openPage(OLD_QUOTE, OLD_BUDGET, { min: 685000, max: 949000 });
    const { effects, log } = recordingEffects(page, { recalculate });
    const outcome = await flow.runAdjustmentApply(effects);
    applyMessages(page, outcome);
    assert(outcome.stage === "recalculate_failed" && outcome.quoteId === "q-v2", `E. ${label}: recalculate_failed on the new quoteId`);
    assert(json(log) === json(["save", `read:q-v2:${PROJECT}`, "commit:q-v2", "recalc:q-v2"]), `E. ${label}: persisted Quote kept (no rollback)`);
    const b = bindingOf(page);
    assert(b.active === "q-v2" && b.url === "q-v2" && b.context.quoteId === "q-v2" && b.mapping === "q-v2", `E. ${label}: URL / context / mapping stay on the new quoteId`);
    assert(page.budgetId === "" && page.budgetSummary === null && b.urlBudgetId == null && b.context.budgetId == null, `E. ${label}: old Budget not shown as current`);
    assert(
      page.notice === "" && page.error === "" && page.warning.includes("新方案版本已保存") && page.warning.includes("尚未按新方案重新计算"),
      `E. ${label}: visible "saved but Budget not recalculated" state`,
    );
  }
  console.log("✓ E. recalculation failure: new Quote stays active, stale Budget cleared, explicit pending-recalculation state");
}

// ---------------------------------------------------------------------------
// F. Production scenario end to end (real services)
// ---------------------------------------------------------------------------

async function checkProductionScenario() {
  db.projects.set(PROJECT, {
    id: PROJECT,
    name: "C0数量模型验收",
    clientName: "C1O Corp",
    industry: "enterprise",
    siteType: "office",
    areaM2: 400,
    targetUsers: 200,
    city: "上海市",
    budgetLevel: "mid",
    budgetLabel: "30-80万",
    deliveryMode: "standard",
    notes: null,
    organizationId: ORG,
  });
  const base = await quoteService.generateQuote({
    projectId: PROJECT,
    workspaceId: "ws-c1o",
    organizationId: ORG,
    companyInfo: { companyName: "C1O Corp", targetUsers: 200, areaM2: 400 },
  });
  const v1 = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: base.quote.id,
    organizationId: ORG,
    projectId: PROJECT,
    decidedBy: "user-c1o",
    selections: [
      { slotKey: TREADMILL_SLOT, action: "confirm", candidateId: null, quantity: 13 },
      { slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "Precor", model: "EFX 885" }, quantity: 9, priceFact: PRICE_FACT },
    ],
  });
  const v1Id = v1.quote.id;
  const calc = async (quoteId: string) => {
    const result = await budgetService.calculateBudget({ quoteId, organizationId: ORG, projectId: PROJECT, budgetTier: "mid" });
    return JSON.parse(json({ budgetId: result.budget.id, structure: result.engine.structure })) as {
      budgetId: string;
      structure: { totalEstimateMin: number; totalEstimateMax: number; detailedItems: BudgetItem[]; detailedItemSlotKeys: Array<string | null> };
    };
  };
  const piView = async (quoteId: string) =>
    JSON.parse(json(await quoteService.getQuoteProductIntelligence({ quoteId, organizationId: ORG, projectId: PROJECT }))) as Awaited<
      ReturnType<typeof quoteService.getQuoteProductIntelligence>
    >;

  const before = await calc(v1Id);
  assert(before.structure.totalEstimateMin === 685000 && before.structure.totalEstimateMax === 949000, "F. 9-unit Budget = 685000–949000");

  // Budget page state after calculating v1.
  const view = await piView(v1Id);
  const reduction = adjustment.buildQuantityReductionOptions({
    items: before.structure.detailedItems,
    slotKeys: before.structure.detailedItemSlotKeys,
    slots: view.slots,
  });
  const ellipticalOption = reduction.options.find((o) => o.slotKey === ELLIPTICAL_SLOT);
  assert(ellipticalOption?.currentQuantity === 9 && ellipticalOption.unitPriceMin === 50000 && ellipticalOption.priceBasis === "VERIFIED", "F. elliptical option: 9 × verified 50000");
  const page = openPage(v1Id, before.budgetId, { min: 685000, max: 949000 });
  const approved = adjustment.readApprovedQuantities(reduction.options, page.drafts);
  assert(approved.ok && approved.approved[ELLIPTICAL_SLOT] === 8, "F. approved quantity 8");
  if (!approved.ok) return;
  const submit = flow.resolveAdjustmentSubmitState({
    quoteId: v1Id,
    organizationId: ORG,
    projectId: PROJECT,
    budgetDetailQuoteId: v1Id,
    piSnapshotQuoteId: view.quoteId,
    optionCount: reduction.options.length,
    approvedOk: approved.ok,
    approvedCount: Object.keys(approved.approved).length,
    loading: false,
    applying: false,
  });
  assert(submit.ok, "F. actionable UI ⇒ submittable");
  const projected = adjustment.estimateAdjustedTotals({
    totalEstimateMin: before.structure.totalEstimateMin,
    totalEstimateMax: before.structure.totalEstimateMax,
    options: reduction.options,
    approved: approved.approved,
  });
  assert(projected.totalEstimateMin === 635000 && projected.totalEstimateMax === 899000, "F. unsaved preview 635000–899000");
  const snapshot = adjustment.buildAdjustedSelectionSnapshot({ slots: view.slots, selections: view.selections, approved: approved.approved });
  assert(snapshot.ok, "F. full snapshot builds for the Production configuration");
  if (!snapshot.ok) return;

  const quotesBefore = db.quotes.size;
  let recalculatedWith = "";
  let after: Awaited<ReturnType<typeof calc>> | null = null;
  const outcome = await flow.runAdjustmentApply({
    approved: approved.approved,
    saveNewVersion: async () => {
      const result = await quoteService.createQuoteVersionWithSelections({
        baseQuoteId: v1Id,
        organizationId: ORG,
        projectId: PROJECT,
        decidedBy: "user-c1o",
        selections: JSON.parse(json(snapshot.selections)),
      });
      return {
        status: 200,
        nextQuoteId: result.quote.status === "READY" ? result.quote.id : "",
        projectId: result.quote.projectId,
        message: "",
      };
    },
    readPersistedSnapshot: async (id) => {
      const v = await piView(id);
      return { quoteId: v.quoteId, selections: v.selections };
    },
    commitVerifiedQuote: commitInto(page),
    recalculate: async (id) => {
      recalculatedWith = id;
      after = await calc(id);
      page.budgetId = after.budgetId;
      page.budgetSummary = { min: after.structure.totalEstimateMin, max: after.structure.totalEstimateMax };
      return true;
    },
  });
  applyMessages(page, outcome);
  assert(outcome.stage === "done" && db.quotes.size === quotesBefore + 1, "F. exactly one new Quote version persisted");
  const v2Id = outcome.stage === "done" ? outcome.quoteId : "";
  const storedV2 = (db.quotes.get(v2Id)!.companyInfo as { productSelections: Selection[] }).productSelections;
  const storedV1 = (db.quotes.get(v1Id)!.companyInfo as { productSelections: Selection[] }).productSelections;
  const v2Elliptical = storedV2.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
  assert(v2Elliptical.quantity === 8 && json(v2Elliptical.priceFact) === json(PRICE_FACT), "F. new Quote stores quantity 8 with the C.2-B price fact intact");
  assert(v2Elliptical.candidate?.source === "customer-specified" && v2Elliptical.candidate.model === "EFX 885", "F. C.2-A customer-specified identity kept");
  assert(storedV2.find((s) => s.slotKey === TREADMILL_SLOT)?.quantity === 13, "F. other decisions carried over");
  assert(storedV1.find((s) => s.slotKey === ELLIPTICAL_SLOT)?.quantity === 9, "F. base Quote immutable (still 9)");
  assert(recalculatedWith === v2Id, "F. Budget recalculation receives the new quoteId");
  const finalBudget = after as Awaited<ReturnType<typeof calc>> | null;
  assert(
    finalBudget !== null && finalBudget.structure.totalEstimateMin === 635000 && finalBudget.structure.totalEstimateMax === 899000,
    "F. recalculated verified-price Budget = 635000–899000",
  );
  assert(
    finalBudget!.structure.totalEstimateMin - before.structure.totalEstimateMin === -50000 &&
      finalBudget!.structure.totalEstimateMax - before.structure.totalEstimateMax === -50000,
    "F. delta from the 9-unit Budget = -50000 / -50000",
  );
  const latestBudget = db.budgets[db.budgets.length - 1];
  assert((latestBudget.assumptions as string[]).some((a) => a.includes(`quoteId=${v2Id}`)), "F. persisted Budget basis is the new quoteId");
  const b = bindingOf(page);
  assert(b.active === v2Id && b.url === v2Id && b.context.quoteId === v2Id && b.mapping === v2Id, "F. active quoteId / URL / context / mapping = new quoteId");
  assert(page.notice.length > 0 && page.error === "" && page.warning === "", "F. success notice only at the end");
  console.log("✓ F. Production 9 → 8: new Quote stores 8, recalculated on it, 635000–899000 (Δ -50000 / -50000)");
}

// ---------------------------------------------------------------------------
// Page wiring + purity + scope
// ---------------------------------------------------------------------------

function checkPageWiring() {
  const page = read(BUDGET_PAGE);
  assert((page.match(/resolveAdjustmentSubmitState\(/g) ?? []).length === 1, "page derives submit eligibility once");
  assert(page.includes("disabled={!adjustmentSubmit.ok}"), "confirm button enabled ⇔ adjustmentSubmit.ok");
  assert(page.includes("暂不能确认调整：{adjustmentSubmit.reason}"), "disabled confirm button shows its reason");

  const applyFn = sliceBetween(page, "async function handleApplyAdjustment()", "async function reloadPiSnapshot()");
  const firstGuard = applyFn.indexOf("if (!adjustmentSubmit.ok");
  assert(firstGuard > 0 && firstGuard < applyFn.indexOf("readApprovedQuantities("), "handler checks the same adjustmentSubmit first");
  assert(applyFn.includes("adjustmentSubmit.reason"), "handler surfaces the same reason");
  assert(!/\)\s*return;/.test(applyFn), "handler has no single-line silent guard returns");
  const segments = applyFn.split("return;");
  for (const seg of segments.slice(0, -1)) {
    const tail = seg.slice(seg.lastIndexOf("if ("));
    assert(tail.includes("setAdjustError("), "every early return in the handler sets a visible error");
  }

  const commitBlock = sliceBetween(applyFn, "commitVerifiedQuote:", "recalculate:");
  for (const stmt of [
    "discardStoredAdjustmentDetail();",
    "setQuoteId(nextQuoteId);",
    "setProjectId(boundProjectId);",
    'setBudgetId("");',
    "setBudgetSummary(null);",
    "setBudgetDetail(null);",
    "setPiSnapshot(null);",
    "setAdjustDrafts({});",
    "writeStoredQuoteIdForProject(boundProjectId, nextQuoteId);",
  ]) {
    assert(commitBlock.includes(stmt), `commit block: ${stmt}`);
  }
  assert(
    /writeStoredProductContext\(\s*\{ organizationId, projectId: boundProjectId, quoteId: nextQuoteId \},\s*\{ mode: "replace" \},?\s*\)/.test(commitBlock),
    "commit block replaces the product context with the new quoteId (no budgetId)",
  );
  assert(
    /router\.replace\(\s*productHref\("\/budget", \{ organizationId, projectId: boundProjectId, quoteId: nextQuoteId \}\),?\s*\)/.test(commitBlock),
    "commit block replaces the URL with the new quoteId and no budgetId",
  );
  assert(!commitBlock.includes("budgetId:"), "commit block carries no budgetId");
  assert((page.match(/setQuoteId\(nextQuoteId\)/g) ?? []).length === 1, "active quoteId switches only in the verified commit");
  assert(/recalculate: async \(nextQuoteId\) => await handleCalculate\(nextQuoteId\)/.test(applyFn), "recalculation uses the verified new quoteId");
  assert(
    applyFn.includes("setAdjustNotice(messages.notice)") && !page.includes("已保存为新方案版本，并按新方案重新计算预算。"),
    "success notice comes only from the final outcome",
  );
  assert(page.includes("async function handleCalculate(quoteIdOverride?: string): Promise<boolean>"), "handleCalculate reports success");
  assert(page.includes("{UNSAVED_ESTIMATE_LABEL}按所填数量"), "draft projection labelled 预估（未保存）");
  assert(page.includes("{adjustWarning ?"), "pending-recalculation warning rendered outside the Budget section");
  assert((page.match(/setAdjustDrafts\(\{\}\)/g) ?? []).length === 2, "drafts cleared only by a verified commit or a successful calculation");

  const lib = read(FLOW_LIB);
  assert(!/^import (?!type )/m.test(lib), "flow lib has type-only imports");
  assert(!/prisma|fetch\(|sessionStorage|localStorage|window\./.test(lib), "flow lib performs no IO");
  assert(flow.UNSAVED_ESTIMATE_LABEL === "预估（未保存）", "unsaved label text");
  console.log("✓ page wiring (shared eligibility, verified commit, new-id recalculation, unsaved labels; pure flow lib)");
}

function checkScope() {
  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const changed = lines("git diff --name-only HEAD");
  const untracked = lines("git ls-files --others --exclude-standard");
  const allowed = new Set([
    BUDGET_PAGE,
    "app/(product)/commercial-context.ts",
    FLOW_LIB,
    "scripts/verify-c1-adjustment-orchestration.ts",
  ]);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
    "login-gzip.html",
  ]);
  for (const file of [...changed, ...untracked]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.1 hotfix scope: unexpected change ${file}`);
  }
  console.log("✓ scope (budget page + product-context helper + flow lib + this verifier; no API / service / Prisma change)");
}

async function main() {
  checkEligibility();
  await checkSuccess();
  await checkPostFailures();
  await checkVerificationMismatch();
  await checkRecalculationFailure();
  await checkProductionScenario();
  checkPageWiring();
  checkScope();
  console.log("\nverify-c1-adjustment-orchestration: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
