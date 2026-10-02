/**
 * Product Core v2 — C.0 Quantity Scaling verification.
 * per-user-v2 quantity matrix, scaling invariants, legacy-v1 compatibility for Quotes without
 * a quantityModel marker, version persistence and verified-price regression.
 * Runs the real quote/budget services with an in-memory Prisma stub. No DB, no network.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

import type { ProductPlaceholder, ProjectInput } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
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

function installStubs() {
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
}

installStubs();

/* eslint-disable @typescript-eslint/no-require-imports */
const templates = require("../lib/templates/placeholderTemplates") as typeof import("../lib/templates/placeholderTemplates");
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
const productEngine = require("../lib/product-engine") as typeof import("../lib/product-engine");
const { generateBudget } = require("../lib/services/tender/generateBudget") as typeof import("../lib/services/tender/generateBudget");
const { resolveEquipmentFocus } = require("../lib/product-engine/configuration-strategy") as typeof import("../lib/product-engine/configuration-strategy");
/* eslint-enable @typescript-eslint/no-require-imports */

const {
  buildPlaceholders,
  QUANTITY_MODEL_LEGACY_V1: LEGACY,
  QUANTITY_MODEL_PER_USER_V2: V2,
  resolveQuoteQuantityModel,
} = templates;

type QuantityModel = typeof LEGACY | typeof V2;

const TREADMILL = "商业级跑步机";
const ELLIPTICAL = "椭圆机";
const STRENGTH = "综合训练器";
const FREE_WEIGHT = "自由力量区设备";
const LOCKER = "储物柜";
const PER_USER = [TREADMILL, ELLIPTICAL, STRENGTH, FREE_WEIGHT, LOCKER] as const;
const STRENGTH_SLOT = `力量设备|${STRENGTH}`;
const TREADMILL_SLOT = `有氧设备|${TREADMILL}`;

function input(users: number | undefined, area: number | undefined, notes = ""): ProjectInput {
  return {
    name: "C0 verify",
    clientName: "C0",
    industry: "enterprise",
    siteType: "office",
    ...(users != null ? { targetUsers: users } : {}),
    ...(area != null ? { areaM2: area } : {}),
    budgetLevel: "mid",
    deliveryMode: "standard",
    notes,
  } as ProjectInput;
}

function qty(rows: ProductPlaceholder[], subCategory: string): number | undefined {
  return rows.find((r) => r.subCategory === subCategory)?.quantity;
}

function quantities(users: number, area: number, model: QuantityModel, notes = "") {
  const rows = buildPlaceholders("c0", input(users, area, notes), { quantityModel: model });
  return PER_USER.map((s) => qty(rows, s) ?? 0);
}

function perUserTotal(users: number, area: number, model: QuantityModel) {
  return quantities(users, area, model).reduce((a, b) => a + b, 0);
}

// ---------------------------------------------------------------------------
// A. per-user-v2 matrix
// ---------------------------------------------------------------------------

const V2_MATRIX: Array<[number, number, number[]]> = [
  [30, 80, [2, 2, 2, 2, 6]],
  [50, 120, [4, 3, 3, 2, 6]],
  [100, 200, [7, 5, 6, 4, 10]],
  [200, 400, [14, 10, 12, 8, 20]],
  [300, 500, [20, 15, 17, 12, 30]],
];

function checkPerUserMatrix() {
  for (const [users, area, expected] of V2_MATRIX) {
    const got = quantities(users, area, V2);
    assert(
      JSON.stringify(got) === JSON.stringify(expected),
      `per-user-v2 ${users}/${area} = ${expected.join("/")} (got ${got.join("/")})`,
    );
    const defaultRows = buildPlaceholders("c0", input(users, area));
    assert(
      JSON.stringify(PER_USER.map((s) => qty(defaultRows, s) ?? 0)) === JSON.stringify(expected),
      `buildPlaceholders default is per-user-v2 (${users}/${area})`,
    );
  }
  console.log("✓ A. per-user-v2 quantity matrix (5 cases incl. lockers)");
}

// ---------------------------------------------------------------------------
// B. scaling invariants
// ---------------------------------------------------------------------------

function checkScalingInvariants() {
  for (const users of [10, 30, 50, 100, 200, 300, 500]) {
    const base = quantities(users, 120, V2);
    for (const area of [40, 80, 240, 480, 1000, 5000]) {
      const got = quantities(users, area, V2);
      assert(
        JSON.stringify(got) === JSON.stringify(base),
        `per-user-v2: area ${area} does not change quantity for ${users} users`,
      );
    }
  }

  for (const area of [80, 120, 400]) {
    let prev = quantities(1, area, V2);
    for (let users = 2; users <= 400; users += 1) {
      const next = quantities(users, area, V2);
      next.forEach((q, i) => assert(q >= prev[i], `monotonic in users: ${PER_USER[i]} at ${users}/${area}`));
      prev = next;
    }
  }

  for (const [users, area] of [
    [50, 120],
    [100, 200],
    [150, 300],
  ]) {
    const small = perUserTotal(users, area, V2);
    const doubled = perUserTotal(users * 2, area * 2, V2);
    assert(doubled <= 2 * small, `per-user-v2 doubling ${users}/${area} is at most linear (${small} → ${doubled})`);
  }
  const legacySmall = perUserTotal(100, 200, LEGACY);
  const legacyDoubled = perUserTotal(200, 400, LEGACY);
  assert(legacyDoubled > 3 * legacySmall, "legacy-v1 doubling stays super-linear (reproduced, not altered)");
  console.log("✓ B. scaling invariants (area-independent, monotonic, linear doubling)");
}

// ---------------------------------------------------------------------------
// C. legacy compatibility
// ---------------------------------------------------------------------------

function checkLegacyCompatibility() {
  const cases: Array<[number, number, number[]]> = [
    [50, 120, [4, 3, 3, 2, 6]],
    [100, 200, [12, 9, 10, 7, 17]],
    [200, 400, [45, 34, 38, 27, 67]],
  ];
  for (const [users, area, expected] of cases) {
    const got = quantities(users, area, LEGACY);
    assert(
      JSON.stringify(got) === JSON.stringify(expected),
      `legacy-v1 ${users}/${area} = ${expected.join("/")} (got ${got.join("/")})`,
    );
  }

  assert(resolveQuoteQuantityModel(null) === LEGACY, "null content → legacy-v1");
  assert(resolveQuoteQuantityModel(undefined) === LEGACY, "undefined content → legacy-v1");
  assert(resolveQuoteQuantityModel({}) === LEGACY, "content without marker → legacy-v1");
  assert(resolveQuoteQuantityModel({ proposal: {}, runtime: {} }) === LEGACY, "pre-C.0 content → legacy-v1");
  assert(resolveQuoteQuantityModel({ quantityModel: "legacy-v1" }) === LEGACY, "explicit legacy-v1");
  assert(resolveQuoteQuantityModel({ quantityModel: "per-user-v3" }) === LEGACY, "unknown marker → legacy-v1");
  assert(resolveQuoteQuantityModel("per-user-v2") === LEGACY, "non-object content → legacy-v1");
  assert(resolveQuoteQuantityModel({ quantityModel: "per-user-v2" }) === V2, "marker per-user-v2 → per-user-v2");
  console.log("✓ C. legacy-v1 compatibility (old quantities reproduced; no marker → legacy-v1)");
}

// ---------------------------------------------------------------------------
// D/E. version persistence + downstream behavior (real services, stubbed Prisma)
// ---------------------------------------------------------------------------

const ORG = "org-c0";
const PROJECT = "p-c0";
const LEGACY_QUOTE = "q-legacy";
const LEGACY_COMPUTED_QUOTE = "q-legacy-computed";
const PRICE_FACT = {
  unitPrice: 30000,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C0-001",
  quotedAt: "2025-01-15",
};

function seed() {
  db.projects.set(PROJECT, {
    id: PROJECT,
    name: "C0 Project",
    clientName: "C0 Corp",
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
  const companyInfo = { companyName: "C0 Corp", targetUsers: 200, areaM2: 400 };
  const legacyProject = db.projects.get(PROJECT)!;
  const legacyRows = buildPlaceholders(PROJECT, input(200, 400), { quantityModel: LEGACY });
  const snapshot = productEngine.buildProductIntelligenceSnapshot({
    notes: undefined,
    templatePlaceholders: legacyRows,
    selections: [],
  });
  db.quotes.set(LEGACY_QUOTE, {
    id: LEGACY_QUOTE,
    projectId: PROJECT,
    workspaceId: "ws-c0",
    organizationId: ORG,
    status: "READY",
    companyInfo,
    content: { proposal: { sections: [] }, runtime: {}, productIntelligence: snapshot },
    orchestrationId: null,
    createdAt: new Date("2026-09-01T00:00:00Z"),
  });
  db.quotes.set(LEGACY_COMPUTED_QUOTE, {
    id: LEGACY_COMPUTED_QUOTE,
    projectId: PROJECT,
    workspaceId: "ws-c0",
    organizationId: ORG,
    status: "READY",
    companyInfo,
    content: { proposal: { sections: [] }, runtime: {} },
    orchestrationId: null,
    createdAt: new Date("2026-09-01T00:00:00Z"),
  });
  assert(legacyProject.organizationId === ORG, "seed project org");
}

type DetailedItem = {
  name: string;
  quantity: number;
  unitPriceMin: number;
  unitPriceMax: number;
  subtotalMin: number;
  subtotalMax: number;
  priceBasis?: string;
  priceFact?: unknown;
};

async function budgetItems(quoteId: string, budgetTier: "low" | "mid" | "high" = "mid") {
  const result = await budgetService.calculateBudget({
    quoteId,
    organizationId: ORG,
    projectId: PROJECT,
    budgetTier,
  });
  return result.engine.structure.detailedItems as unknown as DetailedItem[];
}

function itemQty(items: DetailedItem[], subCategory: string) {
  return items.find((i) => i.name.startsWith(subCategory))?.quantity;
}

function slotQty(view: { slots: Array<{ slotKey: string; templateQuantity: number }> }, slotKey: string) {
  return view.slots.find((s) => s.slotKey === slotKey)?.templateQuantity;
}

async function checkVersionPersistence() {
  seed();

  // Newly generated Quote persists per-user-v2.
  const generated = await quoteService.generateQuote({
    projectId: PROJECT,
    workspaceId: "ws-c0",
    organizationId: ORG,
    companyInfo: { companyName: "C0 Corp", targetUsers: 200, areaM2: 400 },
  });
  const newId = generated.quote.id;
  const stored = db.quotes.get(newId)!;
  const content = stored.content as { quantityModel?: unknown; productIntelligence?: { version?: string } };
  assert(content.quantityModel === V2, "new Quote persists quantityModel = per-user-v2");
  assert(
    content.productIntelligence?.version === productEngine.PRODUCT_INTELLIGENCE_VERSION &&
      productEngine.PRODUCT_INTELLIGENCE_VERSION === "pi1-product-intelligence-1",
    "PRODUCT_INTELLIGENCE_VERSION unchanged",
  );
  const newView = await quoteService.getQuoteProductIntelligence({
    quoteId: newId,
    organizationId: ORG,
    projectId: PROJECT,
  });
  assert(slotQty(newView, TREADMILL_SLOT) === 14, "new Quote Step 4 template quantity = per-user-v2 (14)");
  const newBudget = await budgetItems(newId);
  assert(itemQty(newBudget, TREADMILL) === 14 && itemQty(newBudget, LOCKER) === 20, "new Quote budget uses per-user-v2");

  // Existing Quote without marker keeps legacy-v1 everywhere quantities are regenerated.
  for (const quoteId of [LEGACY_QUOTE, LEGACY_COMPUTED_QUOTE]) {
    const view = await quoteService.getQuoteProductIntelligence({ quoteId, organizationId: ORG, projectId: PROJECT });
    assert(slotQty(view, TREADMILL_SLOT) === 45, `${quoteId}: Step 4 template quantity stays legacy-v1 (45)`);
    const items = await budgetItems(quoteId);
    assert(
      itemQty(items, TREADMILL) === 45 &&
        itemQty(items, ELLIPTICAL) === 34 &&
        itemQty(items, STRENGTH) === 38 &&
        itemQty(items, FREE_WEIGHT) === 27 &&
        itemQty(items, LOCKER) === 67,
      `${quoteId}: budget reproduces legacy-v1 quantities`,
    );
    const quoteRow = await quoteService.getQuoteById(quoteId);
    const pdf = quoteService.buildQuotePlanPdfSource(quoteRow!);
    const pdfTreadmill = pdf.placeholders.find((p) => p.subCategory === TREADMILL)?.quantity;
    assert(pdfTreadmill === 45, `${quoteId}: plan PDF source reproduces legacy-v1 quantity`);
  }
  const legacyView = await quoteService.getQuoteProductIntelligence({
    quoteId: LEGACY_QUOTE,
    organizationId: ORG,
    projectId: PROJECT,
  });
  assert(legacyView.snapshotSource === "stored", "legacy snapshot is still read (version not bumped)");

  // New version from an old Quote: source untouched, new version per-user-v2, overrides win.
  const strengthSlot = legacyView.slots.find((s) => s.slotKey === STRENGTH_SLOT);
  const candidateId = strengthSlot?.candidates[0]?.candidateId;
  assert(Boolean(candidateId), "legacy Quote exposes a strength candidate");
  const sourceBefore = JSON.stringify(db.quotes.get(LEGACY_QUOTE));
  const version = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: LEGACY_QUOTE,
    organizationId: ORG,
    projectId: PROJECT,
    selections: [
      { slotKey: STRENGTH_SLOT, action: "confirm", candidateId, quantity: 9, priceFact: PRICE_FACT },
      { slotKey: TREADMILL_SLOT, action: "confirm", candidateId: null },
    ],
  });
  assert(JSON.stringify(db.quotes.get(LEGACY_QUOTE)) === sourceBefore, "source Quote is not mutated");
  const versionId = version.quote.id;
  assert(versionId !== LEGACY_QUOTE, "new version has a new quoteId");
  const versionRow = db.quotes.get(versionId)!;
  assert(
    (versionRow.content as { quantityModel?: unknown }).quantityModel === V2,
    "new version persists quantityModel = per-user-v2",
  );
  const selections = (versionRow.companyInfo as { productSelections?: Array<Record<string, unknown>> })
    .productSelections ?? [];
  const storedFact = selections.find((s) => s.slotKey === STRENGTH_SLOT)?.priceFact as
    | Record<string, unknown>
    | undefined;
  assert(
    !!storedFact &&
      Object.keys(storedFact).length === Object.keys(PRICE_FACT).length &&
      Object.entries(PRICE_FACT).every(([k, v]) => storedFact[k] === v),
    "verified ProductPriceFact preserved unchanged in the new version",
  );

  const versionItems = await budgetItems(versionId, "mid");
  assert(itemQty(versionItems, TREADMILL) === 14, "non-overridden slot uses per-user-v2 in new version");
  assert(itemQty(versionItems, LOCKER) === 20, "lockers use per-user-v2 in new version");
  const verified = versionItems.find((i) => i.name.startsWith(STRENGTH));
  assert(verified?.quantity === 9, "explicit quantity override wins");
  assert(verified?.priceBasis === "VERIFIED", "verified row stays VERIFIED");
  assert(
    verified?.unitPriceMin === PRICE_FACT.unitPrice && verified?.unitPriceMax === PRICE_FACT.unitPrice,
    "verified unit price = priceFact.unitPrice",
  );
  assert(
    verified?.subtotalMin === PRICE_FACT.unitPrice * 9 && verified?.subtotalMax === PRICE_FACT.unitPrice * 9,
    "verified subtotal = unitPrice × final quantity",
  );
  for (const tier of ["low", "high"] as const) {
    const tierItem = (await budgetItems(versionId, tier)).find((i) => i.name.startsWith(STRENGTH));
    assert(
      tierItem?.priceBasis === "VERIFIED" &&
        tierItem.unitPriceMin === PRICE_FACT.unitPrice &&
        tierItem.subtotalMax === PRICE_FACT.unitPrice * 9,
      `verified unit price is tier-independent (${tier})`,
    );
  }

  const legacyAgain = await budgetItems(LEGACY_QUOTE);
  assert(itemQty(legacyAgain, TREADMILL) === 45, "same old quoteId keeps legacy-v1 after a new version exists");
  console.log("✓ D. version persistence (new Quote / new version per-user-v2, source untouched, old quoteId legacy-v1)");
  console.log("✓ E. downstream (override wins, VERIFIED tier-independent, subtotal = unitPrice × quantity)");
}

// ---------------------------------------------------------------------------
// F. existing behavior unchanged
// ---------------------------------------------------------------------------

function checkExistingBehavior() {
  for (const model of [LEGACY, V2] as const) {
    const tiny = buildPlaceholders("c0", input(1, 50), { quantityModel: model });
    assert(qty(tiny, TREADMILL) === 2, `${model}: treadmill minQuantity 2`);
    assert(qty(tiny, FREE_WEIGHT) === 1, `${model}: free weight minQuantity 1`);
    assert(qty(tiny, LOCKER) === 6, `${model}: locker baseQuantity 6`);
    const big = buildPlaceholders("c0", input(5000, 5000), { quantityModel: model });
    assert(qty(big, "门禁与会员管理系统") === 1, `${model}: access system maxQuantity 1`);
    const unknown = buildPlaceholders("c0", input(undefined, 400), { quantityModel: model });
    assert(
      qty(unknown, TREADMILL) === 2 && qty(unknown, LOCKER) === 6,
      `${model}: unknown headcount keeps base quantities`,
    );
  }

  const strengthNotes = "以力量训练为主";
  const cardioNotes = "以有氧为主";
  const pilatesNotes = "以普拉提为主";
  assert(resolveEquipmentFocus(strengthNotes).strengthPrimary, "precondition: strength primary");
  assert(resolveEquipmentFocus(cardioNotes).cardioPrimary, "precondition: cardio primary");
  const pilatesFocus = resolveEquipmentFocus(pilatesNotes);
  assert(pilatesFocus.studioPrimary && !pilatesFocus.strengthPrimary, "precondition: pilates primary");

  // per-user-v2 raw at 100 users: treadmill 7, elliptical 5, strength 6, free weight 4.
  const strength = quantities(100, 200, V2, strengthNotes);
  assert(
    JSON.stringify(strength.slice(0, 4)) === JSON.stringify([5, 3, 9, 6]),
    `focus multipliers 0.65 / 1.45 (strength primary) → 5/3/9/6 (got ${strength.slice(0, 4).join("/")})`,
  );
  const cardio = quantities(100, 200, V2, cardioNotes);
  assert(
    JSON.stringify(cardio.slice(0, 4)) === JSON.stringify([10, 7, 4, 3]),
    `focus multipliers 1.45 / 0.65 (cardio primary) → 10/7/4/3 (got ${cardio.slice(0, 4).join("/")})`,
  );

  const pilatesRows = buildPlaceholders("c0", input(100, 200, pilatesNotes), { quantityModel: V2 });
  assert(qty(pilatesRows, TREADMILL) === 4, "studio compression 0.5: treadmill round(7 × 0.5) = 4");
  assert(qty(pilatesRows, ELLIPTICAL) === 3, "studio compression 0.5: elliptical round(5 × 0.5) = 3");
  assert(qty(pilatesRows, STRENGTH) === 3, "studio compression 0.5: strength round(6 × 0.5) = 3");
  assert(qty(pilatesRows, FREE_WEIGHT) === undefined, "dropFreeWeight removes free weights when studio is primary");
  assert(
    pilatesRows.some((r) => r.category === "普拉提设备"),
    "studio row still generated",
  );
  const legacyPilates = buildPlaceholders("c0", input(100, 200, pilatesNotes), { quantityModel: LEGACY });
  const studioQty = (rows: ProductPlaceholder[]) => rows.find((r) => r.category === "普拉提设备")?.quantity;
  assert(studioQty(pilatesRows) === studioQty(legacyPilates), "studio template quantities identical across models");
  const studioCap = buildPlaceholders("c0", input(100, 5000, pilatesNotes), { quantityModel: V2 });
  assert(studioQty(studioCap) === 12, "studio maxQuantity 12 still applies");

  const overridden = productEngine.applyProductSelections(
    buildPlaceholders("c0", input(200, 400), { quantityModel: V2 }),
    [{ slotKey: TREADMILL_SLOT, action: "confirm", candidate: null, quantity: 3, decidedAt: "2026-10-01T00:00:00Z" }],
  ).placeholders;
  assert(qty(overridden, TREADMILL) === 3, "explicit override beats per-user-v2 template quantity");
  const estimate = generateBudget("c0", overridden, { priceBand: "mid" }).items.find((i) =>
    i.name.startsWith(TREADMILL),
  );
  assert(
    estimate?.priceBasis === "ESTIMATE" && estimate.subtotalMin === 6000 * 3 && estimate.subtotalMax === 12000 * 3,
    "estimate pricing unchanged (MID 有氧 6000–12000 × quantity)",
  );
  console.log("✓ F. existing behavior (min/max clamp, focus multipliers, studio compression, dropFreeWeight)");
}

// ---------------------------------------------------------------------------
// Static wiring + scope
// ---------------------------------------------------------------------------

function checkStaticWiring() {
  const quoteSvc = read("lib/services/quote.service.ts");
  const budgetSvc = read("lib/services/budget.service.ts");
  for (const [name, src] of [
    ["quote.service", quoteSvc],
    ["budget.service", budgetSvc],
  ] as const) {
    assert(!src.includes("generatePlaceholders"), `${name} no longer regenerates without a quantity model`);
    const calls = src.match(/buildPlaceholders\([^)]*\{[\s\S]*?\}\)/g) ?? [];
    const total = (src.match(/buildPlaceholders\(/g) ?? []).length;
    assert(total > 0 && calls.length === total, `${name}: every buildPlaceholders call passes options`);
    for (const call of calls) {
      assert(call.includes("quantityModel"), `${name}: buildPlaceholders call selects a quantityModel`);
    }
  }
  assert(
    (quoteSvc.match(/resolveQuoteQuantityModel\(quote\.content\)/g) ?? []).length === 2,
    "quote.service: PI view + plan PDF read the Quote's own marker",
  );
  assert(
    quoteSvc.includes("resolveQuoteQuantityModel(base.content)"),
    "quote.service: new-version slot validation reads the source Quote's marker",
  );
  assert(
    /quantityModel: QUANTITY_MODEL_PER_USER_V2,\s*\} as unknown as Prisma\.JsonObject/.test(quoteSvc),
    "generateQuote persists the marker in Quote.content",
  );
  assert(
    budgetSvc.includes("resolveQuoteQuantityModel(quote.content)"),
    "budget.service: calculateBudget reads the Quote's own marker",
  );
  console.log("✓ static wiring (all Quote-scoped regeneration selects the persisted model)");
}

function checkScope() {
  const changed = execSync("git diff --name-only HEAD", { cwd: ROOT, encoding: "utf8" })
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const untracked = execSync("git ls-files --others --exclude-standard", { cwd: ROOT, encoding: "utf8" })
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const allowed = new Set([
    "lib/templates/placeholderTemplates.ts",
    "lib/services/quote.service.ts",
    "lib/services/budget.service.ts",
    "scripts/verify-c0-quantity-scaling.ts",
  ]);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
    "login-gzip.html",
  ]);
  for (const file of [...changed, ...untracked]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.0 scope: unexpected change ${file}`);
  }
  console.log("✓ scope (only the 3 authorized production files + this verifier)");
}

async function main() {
  checkPerUserMatrix();
  checkScalingInvariants();
  checkLegacyCompatibility();
  await checkVersionPersistence();
  checkExistingBehavior();
  checkStaticWiring();
  checkScope();
  console.log("\nverify-c0-quantity-scaling: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
