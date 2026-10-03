/**
 * Product Core v2 — C.2-B2 Procurement Pricing Facts: Quote UI + round-trip verification.
 * The Quote page's Step 4 draft helpers (extracted from the page source, current vs the pre-B2
 * page at PRE_B2_REF) drive the real quote / budget services with an in-memory Prisma stub:
 * stored Quote → hydration → edit → payload → server validation → new version → reload →
 * C.1 snapshot → new version. No DB, no network, no files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

import type { BudgetItem } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
const QUOTE_PAGE = "app/(product)/quote/page.tsx";
/** C.2-A production-accepted commit; the last Quote page without procurement metadata. */
const PRE_B2_REF = "9ba68bb0";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function json(value: unknown) {
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// In-memory Prisma stub
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

/* eslint-disable @typescript-eslint/no-require-imports */
const pi = require("../lib/product-engine/product-intelligence") as typeof import("../lib/product-engine/product-intelligence");
const adjustment = require("../lib/budget/over-budget-adjustment") as typeof import("../lib/budget/over-budget-adjustment");
const workflow = require("../app/(product)/quote/quote-workflow") as typeof import("../app/(product)/quote/quote-workflow");
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
/* eslint-enable @typescript-eslint/no-require-imports */

type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;
type PiView = Awaited<ReturnType<typeof quoteService.getQuoteProductIntelligence>>;

type Draft = {
  mode: string;
  candidateId?: string;
  customBrand?: string;
  customModel?: string;
  quantity: string;
  unitPrice?: string;
  priceSourceType?: string;
  priceSourceReference?: string;
  priceQuotedAt?: string;
  priceSupplier?: string;
  priceTaxStatus?: string;
  priceValidUntil?: string;
};
type PayloadItem = Record<string, unknown> & { slotKey: string; priceFact?: Record<string, unknown> };
type PageHelpers = {
  initialSlotDrafts(view: unknown): { drafts: Record<string, Draft>; warnings: string[] };
  buildSelectionPayload(slots: unknown[], drafts: Record<string, Draft>): PayloadItem[];
  priceDraftError(draft: Draft): string | null;
  priceFactFromDraft?: (draft: Draft) => Record<string, unknown> | undefined;
};

/** Step 4 helpers live inside the page module (App Router pages cannot export them). */
function loadPageHelpers(source: string): PageHelpers {
  const start = source.indexOf("type ProductCandidateView = {");
  const end = source.indexOf("const QUOTE_PROPOSAL_KEY");
  assert(start > 0 && end > start, "locate Step 4 helper region in the Quote page");
  const region = source.slice(start, end);
  const names = ["initialSlotDrafts", "buildSelectionPayload", "priceDraftError", "priceFactFromDraft"].filter((n) =>
    region.includes(`function ${n}(`),
  );
  const js = ts.transpileModule(`function __factory() {\n${region}\nreturn { ${names.join(", ")} };\n}`, {
    compilerOptions: { module: ts.ModuleKind.None, target: ts.ScriptTarget.ES2020, alwaysStrict: true },
  }).outputText;
  return vm.runInThisContext(`(function () {${js}\nreturn __factory();\n})()`) as PageHelpers;
}

const pageSource = fs.readFileSync(path.join(ROOT, QUOTE_PAGE), "utf8");
const page = loadPageHelpers(pageSource);
const legacyPage = loadPageHelpers(execSync(`git show "${PRE_B2_REF}:${QUOTE_PAGE}"`, { cwd: ROOT, encoding: "utf8" }));

const ORG = "org-c2b2";
const PROJECT = "p-c2b2";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
const STRENGTH_SLOT = "力量设备|综合训练器";
const BASE_KEYS = ["unitPrice", "currency", "sourceType", "sourceReference", "quotedAt"];

const PRICE_FACT = {
  unitPrice: 18800,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C2B2-001",
  quotedAt: "2026-09-20",
};
const META = { supplier: "上海力健 器材有限公司", taxStatus: "tax_included", validUntil: "2026-12-31" };
const FULL_FACT = { ...PRICE_FACT, ...META };
/** Historical quotation: expired before today but valid for its own quote date. */
const EXPIRED_BASE = {
  unitPrice: 26600,
  currency: "CNY",
  sourceType: "procurement_contract",
  sourceReference: "PC-C2B2-002",
  quotedAt: "2025-01-15",
};
const EXPIRED_META = { supplier: "Life Fitness 华东代理", taxStatus: "tax_excluded", validUntil: "2025-06-30" };
const EXPIRED_FACT = { ...EXPIRED_BASE, ...EXPIRED_META };

const PRICE_DRAFT = {
  unitPrice: "18800",
  priceSourceType: "supplier_quote",
  priceSourceReference: "SQ-C2B2-001",
  priceQuotedAt: "2026-09-20",
};

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) deepFreeze(v);
    Object.freeze(value);
  }
  return value;
}

/** The API JSON boundary between the PI service and the page. */
async function piView(quoteId: string): Promise<PiView> {
  const view = await quoteService.getQuoteProductIntelligence({ quoteId, organizationId: ORG, projectId: PROJECT });
  return JSON.parse(json(view)) as PiView;
}

/** Same expressions as the page: initialSelectionJson from hydration, selectionDirty by payload JSON. */
function isDirty(view: PiView, initial: Record<string, Draft>, drafts: Record<string, Draft>) {
  return json(page.buildSelectionPayload(view.slots, drafts)) !== json(page.buildSelectionPayload(view.slots, initial));
}

/** Same request body as handleConfirmProductConfiguration. */
async function saveDrafts(baseQuoteId: string, view: PiView, drafts: Record<string, Draft>) {
  for (const d of Object.values(drafts)) {
    assert(page.priceDraftError(d) == null, `save precondition: no draft error (${page.priceDraftError(d)})`);
  }
  const payload = page.buildSelectionPayload(view.slots, drafts);
  const result = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId,
    organizationId: ORG,
    projectId: PROJECT,
    decidedBy: "user-c2b2",
    selections: JSON.parse(json(workflow.withExplicitTemplateConfirmations(view.slots, payload))),
  });
  return { quoteId: result.quote.id, payload };
}

function storedSelections(quoteId: string): Selection[] {
  return (db.quotes.get(quoteId)!.companyInfo as { productSelections?: Selection[] }).productSelections ?? [];
}

function stored(quoteId: string, slotKey: string): Selection {
  return storedSelections(quoteId).find((s) => s.slotKey === slotKey)!;
}

function payloadFact(payload: PayloadItem[], slotKey: string) {
  return payload.find((p) => p.slotKey === slotKey)?.priceFact;
}

function factFromDraft(draft: Draft) {
  return page.priceFactFromDraft!(draft);
}

const candidateDraft = (patch: Partial<Draft>): Draft => ({ mode: "candidate", candidateId: "c", quantity: "", ...PRICE_DRAFT, ...patch });

async function seed() {
  db.projects.set(PROJECT, {
    id: PROJECT,
    name: "C2B2 Project",
    clientName: "C2B2 Corp",
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
    workspaceId: "ws-c2b2",
    organizationId: ORG,
    companyInfo: { companyName: "C2B2 Corp", targetUsers: 200, areaM2: 400 },
  });
  const baseView = await piView(base.quote.id);
  const treadmill = baseView.slots.find((s) => s.slotKey === TREADMILL_SLOT)!;
  const strength = baseView.slots.find((s) => s.slotKey === STRENGTH_SLOT)!;
  assert(treadmill.candidates.length > 1 && strength.candidates.length > 0, "fixture: catalog candidates present");
  assert(baseView.slots.find((s) => s.slotKey === ELLIPTICAL_SLOT)!.candidates.length === 0, "fixture: 椭圆机 has no catalog candidate");
  // v0: an old Quote whose verified prices carry no procurement metadata.
  const v0 = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: base.quote.id,
    organizationId: ORG,
    projectId: PROJECT,
    selections: [
      { slotKey: TREADMILL_SLOT, action: "replace", candidateId: treadmill.candidates[1].candidateId, quantity: 6, priceFact: PRICE_FACT },
      { slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "Precor", model: "EFX 885" }, quantity: 4, priceFact: EXPIRED_BASE },
      { slotKey: STRENGTH_SLOT, action: "confirm", candidateId: strength.candidates[0].candidateId },
    ],
  });
  return { v0Id: v0.quote.id, treadmillCandidateId: treadmill.candidates[1].candidateId };
}

// ---------------------------------------------------------------------------
// 1. old price fact: hydration / payload identical to the pre-B2 page
// ---------------------------------------------------------------------------

async function checkOldHydration(v0Id: string) {
  const view = deepFreeze(await piView(v0Id));
  const init = page.initialSlotDrafts(view);
  const legacyInit = legacyPage.initialSlotDrafts(view);
  assert(json(init) === json(legacyInit), `old facts hydrate exactly like the pre-B2 page (got ${json(init)})`);
  for (const draft of Object.values(init.drafts)) {
    assert(!("priceSupplier" in draft) && !("priceTaxStatus" in draft) && !("priceValidUntil" in draft), "no metadata draft keys synthesized");
  }
  const payload = page.buildSelectionPayload(view.slots, init.drafts);
  assert(json(payload) === json(legacyPage.buildSelectionPayload(view.slots, legacyInit.drafts)), "old payload identical to the pre-B2 page");
  for (const slot of [TREADMILL_SLOT, ELLIPTICAL_SLOT]) {
    assert(json(Object.keys(payloadFact(payload, slot) ?? {})) === json(BASE_KEYS), `${slot}: old payload priceFact has exactly the 5 base keys`);
  }

  const legacyDraftSets: Draft[] = [
    candidateDraft({}),
    candidateDraft({ unitPrice: "" }),
    candidateDraft({ unitPrice: "-1" }),
    candidateDraft({ priceSourceType: "" }),
    candidateDraft({ priceSourceReference: "  " }),
    candidateDraft({ priceQuotedAt: "" }),
    candidateDraft({ unitPrice: "", priceSourceType: "", priceSourceReference: "", priceQuotedAt: "" }),
    { mode: "custom", customBrand: "Precor", customModel: "EFX 885", quantity: "2", ...PRICE_DRAFT },
    { mode: "template", quantity: "", ...PRICE_DRAFT },
    { mode: "remove", quantity: "" },
  ];
  for (const draft of legacyDraftSets) {
    deepFreeze(draft);
    assert(page.priceDraftError(draft) === legacyPage.priceDraftError(draft), `priceDraftError unchanged for ${json(draft)}`);
  }
  const slots = view.slots;
  const drafts = Object.fromEntries(slots.map((s, i) => [s.slotKey, legacyDraftSets[i % legacyDraftSets.length]]));
  assert(json(page.buildSelectionPayload(slots, drafts)) === json(legacyPage.buildSelectionPayload(slots, drafts)), "legacy draft sets build the same payload");
  // Empty-string metadata (mode switch resets) is not draft activity and never reaches the fact.
  const reset = candidateDraft({ priceSupplier: "", priceTaxStatus: "", priceValidUntil: "" });
  assert(page.priceDraftError(reset) == null && json(factFromDraft(reset)) === json(PRICE_FACT), "blank metadata drafts emit the old 5-field fact");
  const resetEmpty = candidateDraft({ unitPrice: "", priceSourceType: "", priceSourceReference: "", priceQuotedAt: "", priceSupplier: "", priceTaxStatus: "", priceValidUntil: "" });
  assert(page.priceDraftError(resetEmpty) == null && factFromDraft(resetEmpty) === undefined, "fully blank price section → no price, no error");
  console.log("✓ 1. old facts: hydration / payload / errors identical to the pre-B2 page; no metadata keys synthesized");
}

// ---------------------------------------------------------------------------
// 3–6. field semantics on the client (server stays canonical)
// ---------------------------------------------------------------------------

function checkFieldSemantics() {
  // 3. supplier
  assert(/const MAX_PRICE_SUPPLIER_LENGTH = 100;/.test(pageSource) && /maxLength=\{MAX_PRICE_SUPPLIER_LENGTH\}/.test(pageSource), "3. supplier input maxLength 100");
  for (const raw of ["  上海力健   器材\u3000有限公司 ", "Cafe\u0301  Sports", "ACME", "x".repeat(100)]) {
    const fact = factFromDraft(candidateDraft({ priceSupplier: raw }));
    const server = pi.validatePriceFact({ ...PRICE_FACT, supplier: raw });
    assert(server.ok && fact?.supplier === server.priceFact.supplier, `3. client supplier normalization matches B1 for ${json(raw)} (got ${json(fact)})`);
  }
  for (const blank of ["", "   ", "\u3000"]) {
    const draft = candidateDraft({ priceSupplier: blank });
    assert(page.priceDraftError(draft) == null && json(factFromDraft(draft)) === json(PRICE_FACT), `3. blank supplier ${json(blank)} omitted`);
  }
  assert(page.priceDraftError(candidateDraft({ priceSupplier: "x".repeat(101) })) === "供应商不超过 100 字", "3. supplier > 100 blocked by the UI");
  assert(page.priceDraftError(candidateDraft({ priceSupplier: ` ${"x".repeat(100)}  ` })) == null, "3. length measured after normalization");

  // 4. taxStatus
  assert(json(factFromDraft(candidateDraft({ priceTaxStatus: "" }))) === json(PRICE_FACT), "4. blank taxStatus omitted (never \"\")");
  for (const status of ["tax_included", "tax_excluded"]) {
    assert(json(factFromDraft(candidateDraft({ priceTaxStatus: status }))) === json({ ...PRICE_FACT, taxStatus: status }), `4. ${status} emitted`);
  }
  assert(/<option value="">含税状态：未注明<\/option>/.test(pageSource), "4. select default = 未注明");
  assert(/\{ value: "tax_included", label: "含税" \}/.test(pageSource) && /\{ value: "tax_excluded", label: "不含税" \}/.test(pageSource), "4. select options 含税 / 不含税");

  // 5. validUntil
  assert(json(factFromDraft(candidateDraft({ priceValidUntil: "" }))) === json(PRICE_FACT), "5. blank validUntil omitted (never \"\")");
  assert(json(factFromDraft(candidateDraft({ priceValidUntil: "2026-12-31" }))) === json({ ...PRICE_FACT, validUntil: "2026-12-31" }), "5. date emitted");
  assert(json(factFromDraft(candidateDraft({ priceValidUntil: "2026-09-20" }))) === json({ ...PRICE_FACT, validUntil: "2026-09-20" }), "5. validUntil = quotedAt allowed");
  const early = candidateDraft({ priceValidUntil: "2026-09-19" });
  assert(page.priceDraftError(early) === "报价有效期不能早于报价日期" && factFromDraft(early) === undefined, "5. earlier than quotedAt blocked by the UI");
  const expired = { mode: "custom", customBrand: "Precor", customModel: "EFX 885", quantity: "4", unitPrice: "26600", priceSourceType: "procurement_contract", priceSourceReference: "PC-C2B2-002", priceQuotedAt: "2025-01-15", priceValidUntil: "2025-06-30" };
  assert(page.priceDraftError(expired) == null && factFromDraft(expired)?.validUntil === "2025-06-30", "5. expired but >= quotedAt allowed (no >= today rule)");
  assert(/type="date"[\s\S]{0,300}priceValidUntil/.test(pageSource), "5. validUntil uses <input type=\"date\">");

  // 6. metadata-only drafts are errors, never silently dropped
  const blankRequired = { unitPrice: "", priceSourceType: "", priceSourceReference: "", priceQuotedAt: "" };
  for (const meta of [{ priceSupplier: "ACME" }, { priceTaxStatus: "tax_included" }, { priceValidUntil: "2026-12-31" }]) {
    for (const mode of [{ mode: "candidate", candidateId: "c" }, { mode: "custom", customBrand: "Precor", customModel: "EFX 885" }]) {
      const draft: Draft = { quantity: "", ...mode, ...blankRequired, ...meta };
      assert(
        page.priceDraftError(draft) === "填写供应商、含税状态或有效期时，需同时填写核实单价、来源类型、来源编号和报价日期",
        `6. metadata-only draft ${json(meta)} (${mode.mode}) is a validation error`,
      );
    }
  }
  assert(page.priceDraftError(candidateDraft({ priceSourceReference: "", priceSupplier: "ACME" })) === "请填写报价单号 / 合同号", "6. partial required + metadata keeps the existing required-field message");
  assert(/priceDraftError\(d\) == null/.test(pageSource) && /!draftQuantitiesValid \|\|/.test(pageSource), "6. any price-draft error disables save");

  // 12 (client half). The page never emits keys outside the canonical fact.
  const full = factFromDraft(candidateDraft({ priceSupplier: "ACME", priceTaxStatus: "tax_excluded", priceValidUntil: "2027-01-01" }));
  assert(json(Object.keys(full ?? {})) === json([...BASE_KEYS, "supplier", "taxStatus", "validUntil"]), "client fact keys = canonical key order");

  // copy
  assert(pageSource.includes("核实单价、来源类型、来源编号和报价日期为必填；供应商、含税状态和有效期可选"), "copy: required vs optional fields");
  assert(!/供应商已认证|已认证供应商|供应商认证通过|保证价格|价格保证|最终采购价|最终成交价/.test(pageSource), "copy: no certification / guaranteed / final-price wording");
  console.log("✓ 3–6. supplier / taxStatus / validUntil client semantics; metadata-only drafts blocked, never dropped");
}

// ---------------------------------------------------------------------------
// 2 / 7–13. round-trip through the services
// ---------------------------------------------------------------------------

async function checkRoundTrip(v0Id: string, treadmillCandidateId: string) {
  const view0 = await piView(v0Id);
  const init0 = page.initialSlotDrafts(view0).drafts;

  // 2. edit metadata on the reference + custom rows, save as a new version
  const edited: Record<string, Draft> = {
    ...init0,
    [TREADMILL_SLOT]: { ...init0[TREADMILL_SLOT], priceSupplier: "  上海力健   器材有限公司 ", priceTaxStatus: "tax_included", priceValidUntil: "2026-12-31" },
    [ELLIPTICAL_SLOT]: { ...init0[ELLIPTICAL_SLOT], priceSupplier: EXPIRED_META.supplier, priceTaxStatus: "tax_excluded", priceValidUntil: "2025-06-30" },
  };
  assert(isDirty(view0, init0, edited), "adding metadata marks the selection dirty");
  const v1 = await saveDrafts(v0Id, view0, edited);
  assert(json(payloadFact(v1.payload, TREADMILL_SLOT)) === json(FULL_FACT), `2. payload carries normalized metadata (got ${json(payloadFact(v1.payload, TREADMILL_SLOT))})`);
  assert(json(payloadFact(v1.payload, ELLIPTICAL_SLOT)) === json(EXPIRED_FACT), "2. custom payload carries metadata");

  // 8. reference candidate
  const t1 = stored(v1.quoteId, TREADMILL_SLOT);
  assert(t1.candidate?.candidateId === treadmillCandidateId && t1.candidate.source === "reference-catalog" && t1.quantity === 6, "8. reference identity + quantity stored");
  assert(json(t1.priceFact) === json(FULL_FACT), "8. stored Quote keeps reference metadata");
  // 9 / 11. customer-specified + expired validUntil
  const e1 = stored(v1.quoteId, ELLIPTICAL_SLOT);
  assert(
    e1.candidate?.source === "customer-specified" &&
      e1.candidate.candidateId === pi.customProductCandidateId("Precor", "EFX 885") &&
      e1.quantity === 4 &&
      json(e1.priceFact) === json(EXPIRED_FACT),
    "9 / 11. custom identity, quantity and expired metadata stored",
  );
  assert(stored(v1.quoteId, STRENGTH_SLOT).priceFact === undefined, "unpriced row stays unpriced");
  assert(db.quotes.get(v0Id)!.status === "READY" && json(stored(v0Id, TREADMILL_SLOT).priceFact) === json(PRICE_FACT), "old version untouched");

  // reload
  const view1 = await piView(v1.quoteId);
  const init1 = page.initialSlotDrafts(view1);
  assert(init1.warnings.length === 0, "reload raises no fallback warning");
  assert(
    json(init1.drafts[TREADMILL_SLOT]) ===
      json({ mode: "candidate", candidateId: treadmillCandidateId, quantity: "6", ...PRICE_DRAFT, priceSupplier: META.supplier, priceTaxStatus: "tax_included", priceValidUntil: "2026-12-31" }),
    `2 / 8. reload hydrates reference metadata (got ${json(init1.drafts[TREADMILL_SLOT])})`,
  );
  assert(
    init1.drafts[ELLIPTICAL_SLOT].mode === "custom" &&
      init1.drafts[ELLIPTICAL_SLOT].customBrand === "Precor" &&
      init1.drafts[ELLIPTICAL_SLOT].quantity === "4" &&
      init1.drafts[ELLIPTICAL_SLOT].priceSupplier === EXPIRED_META.supplier &&
      init1.drafts[ELLIPTICAL_SLOT].priceTaxStatus === "tax_excluded" &&
      init1.drafts[ELLIPTICAL_SLOT].priceValidUntil === "2025-06-30",
    "9. reload hydrates custom identity, quantity and metadata",
  );
  assert(!isDirty(view1, init1.drafts, init1.drafts), "reloaded version is clean (payload = stored)");
  assert(json(page.buildSelectionPayload(view1.slots, init1.drafts).filter((p) => p.priceFact)) === json(v1.payload.filter((p) => p.priceFact)), "reload payload = saved payload");
  console.log("✓ 2 / 8 / 9. metadata: draft → payload → server → stored Quote → reload (reference + customer-specified)");

  // 7. each metadata field independently marks the selection dirty
  const t = init1.drafts[TREADMILL_SLOT];
  const edits: Array<[string, Partial<Draft>]> = [
    ["supplier changed", { priceSupplier: "另一家供应商" }],
    ["supplier cleared", { priceSupplier: "" }],
    ["taxStatus changed", { priceTaxStatus: "tax_excluded" }],
    ["taxStatus cleared", { priceTaxStatus: "" }],
    ["validUntil changed", { priceValidUntil: "2027-03-31" }],
    ["validUntil cleared", { priceValidUntil: "" }],
  ];
  for (const [label, patch] of edits) {
    assert(isDirty(view1, init1.drafts, { ...init1.drafts, [TREADMILL_SLOT]: { ...t, ...patch } }), `7. ${label} → dirty`);
  }
  assert(!isDirty(view1, init1.drafts, { ...init1.drafts, [TREADMILL_SLOT]: { ...t, priceSupplier: ` ${t.priceSupplier} ` } }), "7. whitespace-only supplier edit is not a change");
  // clearing a field saves without it
  const cleared = await saveDrafts(v1.quoteId, view1, { ...init1.drafts, [TREADMILL_SLOT]: { ...t, priceTaxStatus: "", priceValidUntil: "" } });
  assert(json(stored(cleared.quoteId, TREADMILL_SLOT).priceFact) === json({ ...PRICE_FACT, supplier: META.supplier }), "7. cleared fields are removed from the stored fact (no \"\" values)");
  console.log("✓ 7. supplier / taxStatus / validUntil each mark the selection dirty; cleared fields are omitted");

  // 10 / 11. C.1 snapshot from the reloaded version, then save
  const budget1 = await budgetService.calculateBudget({ quoteId: v1.quoteId, organizationId: ORG, projectId: PROJECT, budgetTier: "mid" });
  const items1 = budget1.engine.structure.detailedItems as unknown as BudgetItem[];
  const keys1 = budget1.engine.structure.detailedItemSlotKeys;
  const reduction = adjustment.buildQuantityReductionOptions({ items: items1, slotKeys: keys1, slots: view1.slots });
  assert(reduction.options.some((o) => o.slotKey === TREADMILL_SLOT) && reduction.options.some((o) => o.slotKey === ELLIPTICAL_SLOT), "fixture: priced slots are reducible");
  const approved = { [TREADMILL_SLOT]: 3, [ELLIPTICAL_SLOT]: 2 };
  const selectionsBefore = json(view1.selections);
  const snapshot = adjustment.buildAdjustedSelectionSnapshot({ slots: view1.slots, selections: view1.selections, approved });
  assert(snapshot.ok, `C.1 snapshot builds (got ${json(snapshot)})`);
  const snap = (slot: string) => (snapshot.ok ? snapshot.selections.find((s) => s.slotKey === slot) : undefined);
  assert(json(snap(TREADMILL_SLOT)?.priceFact) === json(FULL_FACT) && snap(TREADMILL_SLOT)?.candidateId === treadmillCandidateId, "10. snapshot: reference identity + metadata unchanged");
  assert(
    json(snap(ELLIPTICAL_SLOT)?.priceFact) === json(EXPIRED_FACT) && json(snap(ELLIPTICAL_SLOT)?.customProduct) === json({ brand: "Precor", model: "EFX 885" }),
    "10. snapshot: custom identity + metadata unchanged",
  );
  assert(json(view1.selections) === selectionsBefore, "snapshot does not mutate the PI view");
  const v2 = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: v1.quoteId,
    organizationId: ORG,
    projectId: PROJECT,
    decidedBy: "user-c2b2",
    selections: JSON.parse(json(snapshot.ok ? snapshot.selections : [])),
  });
  const withoutQuantity = (rows: Selection[]) =>
    json(rows.map((s) => ({ ...s, quantity: undefined, decidedAt: undefined, decidedBy: undefined })));
  assert(withoutQuantity(storedSelections(v2.quote.id)) === withoutQuantity(storedSelections(v1.quoteId)), "10. C.1 version differs from its base only in quantity");
  assert(stored(v2.quote.id, TREADMILL_SLOT).quantity === 3 && stored(v2.quote.id, ELLIPTICAL_SLOT).quantity === 2, "10. approved quantities applied");
  assert(json(stored(v2.quote.id, ELLIPTICAL_SLOT).priceFact) === json(EXPIRED_FACT), "11. expired validUntil (< today, >= quotedAt) saved through C.1 revalidation");
  const view2 = await piView(v2.quote.id);
  const init2 = page.initialSlotDrafts(view2).drafts;
  assert(init2[TREADMILL_SLOT].priceSupplier === META.supplier && init2[ELLIPTICAL_SLOT].priceValidUntil === "2025-06-30" && init2[ELLIPTICAL_SLOT].quantity === "2", "10. C.1 version reloads into the editor with metadata");
  console.log("✓ 10 / 11. C.1 snapshot keeps identity + metadata, changes only quantity; expired validUntil saves");

  // 12. spoofed fields from a forged client stay server-filtered
  const forged = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: v1.quoteId,
    organizationId: ORG,
    projectId: PROJECT,
    selections: [
      { slotKey: TREADMILL_SLOT, action: "replace", candidateId: treadmillCandidateId, quantity: 6, priceFact: { ...FULL_FACT, verified: true, taxRate: 0.13, supplierId: "sup-1", priceBasis: "VERIFIED" } },
    ],
  });
  assert(json(stored(forged.quote.id, TREADMILL_SLOT).priceFact) === json(FULL_FACT), "12. unknown / spoofed fact keys filtered by B1");
  let rejected = "";
  try {
    await quoteService.createQuoteVersionWithSelections({
      baseQuoteId: v1.quoteId,
      organizationId: ORG,
      projectId: PROJECT,
      selections: [{ slotKey: TREADMILL_SLOT, action: "replace", candidateId: treadmillCandidateId, priceFact: { ...PRICE_FACT, taxStatus: "" } }],
    });
  } catch (err) {
    rejected = `${(err as Error).name}:${(err as Error).message}`;
  }
  assert(rejected.startsWith("ProductSelectionInputError:"), `12. a forged "" taxStatus is rejected server-side (got ${rejected})`);
  console.log("✓ 12. forged fact keys filtered and invalid metadata rejected by the B1 server boundary");

  // 13. Budget numbers: metadata version vs the same configuration without metadata
  for (const tier of ["low", "mid", "high"] as const) {
    const without = await budgetService.calculateBudget({ quoteId: v0Id, organizationId: ORG, projectId: PROJECT, budgetTier: tier });
    const withMeta = await budgetService.calculateBudget({ quoteId: v1.quoteId, organizationId: ORG, projectId: PROJECT, budgetTier: tier });
    const strip = (items: unknown) => json((items as BudgetItem[]).map((it) => ({ ...it, priceFact: undefined })));
    assert(
      without.engine.structure.totalEstimateMin === withMeta.engine.structure.totalEstimateMin &&
        without.engine.structure.totalEstimateMax === withMeta.engine.structure.totalEstimateMax,
      `13. ${tier}: totals identical with vs without metadata`,
    );
    assert(strip(without.engine.structure.detailedItems) === strip(withMeta.engine.structure.detailedItems), `13. ${tier}: items identical apart from priceFact metadata`);
    const rows = withMeta.engine.structure.detailedItems as unknown as BudgetItem[];
    const keys = withMeta.engine.structure.detailedItemSlotKeys;
    const tRow = rows[keys.indexOf(TREADMILL_SLOT)];
    const eRow = rows[keys.indexOf(ELLIPTICAL_SLOT)];
    assert(tRow.priceBasis === "VERIFIED" && tRow.unitPriceMin === 18800 && tRow.subtotalMin === 18800 * 6, `13. ${tier}: VERIFIED price, no tax adjustment`);
    assert(eRow.priceBasis === "VERIFIED" && eRow.unitPriceMin === 26600 && eRow.subtotalMin === 26600 * 4, `13. ${tier}: expired quotation stays VERIFIED`);
  }
  console.log("✓ 13. Budget LOW / MID / HIGH totals and items identical with vs without metadata");
}

// ---------------------------------------------------------------------------
// 14. static + scope
// ---------------------------------------------------------------------------

function checkScope() {
  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const untouched = [
    "lib/budget/over-budget-adjustment.ts",
    "lib/services/tender/generateBudget.ts",
    "lib/services/budget.service.ts",
    "lib/services/quote.service.ts",
    "app/(product)/budget/page.tsx",
    "app/api/quote/product-intelligence/route.ts",
    "lib/pdf",
    "prisma/schema.prisma",
  ];
  assert(lines(`git diff --name-only ${PRE_B2_REF} -- ${untouched.map((f) => `"${f}"`).join(" ")}`).length === 0, "C.1 / Budget / Quote service / budget page / API / PDF / schema unchanged");
  const changed = lines(`git diff --name-only ${PRE_B2_REF}`);
  const untracked = lines("git ls-files --others --exclude-standard");
  const allowed = new Set([
    "lib/domain/tender.ts",
    "lib/product-engine/product-intelligence.ts",
    QUOTE_PAGE,
    "scripts/verify-c2-b1-price-fact-procurement-metadata.ts",
    "scripts/verify-c2-b2-quote-procurement-ui.ts",
  ]);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
    "login-gzip.html",
  ]);
  for (const file of [...changed, ...untracked]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.2-B2 scope: unexpected change ${file}`);
    assert(!file.startsWith("prisma/"), `C.2-B2: no Prisma / schema / migration change (${file})`);
  }
  console.log("✓ 14. scope (B1 files + Quote page + B1/B2 verifiers; no Prisma / schema / migration change)");
}

async function main() {
  const { v0Id, treadmillCandidateId } = await seed();
  await checkOldHydration(v0Id);
  checkFieldSemantics();
  await checkRoundTrip(v0Id, treadmillCandidateId);
  checkScope();
  console.log("\nverify-c2-b2-quote-procurement-ui: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
