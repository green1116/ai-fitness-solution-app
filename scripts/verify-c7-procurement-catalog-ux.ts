/**
 * Product Core v2 — C.7 Organization Procurement Catalog UX verifier.
 *
 * UI-only WP on top of the accepted C.6-B commit. Asserts (G01–G26):
 *  - a server page resolves user / organization / OWNER-ADMIN authorization and hands a client manager
 *    the shared PI category options (presentation-only export, additive to product-intelligence.ts);
 *  - the manager reuses GET / POST / PATCH / DELETE /api/procurement-products unchanged, keeps
 *    产品身份 and 核实采购价 apart, clears a priceFact with PATCH priceFact:null, soft-deactivates with
 *    explicit confirmation and maps every failure to fixed Chinese copy;
 *  - multiple brands / models coexist in one category end-to-end through the unchanged PI adaptation;
 *  - Quote gains exactly one low-key 「管理组织采购库」 link; the candidate price badge is deferred;
 *  - schema / migrations / API / service / ranking / pricing / Budget / PDF / Tender / C.3 untouched.
 *
 * No live DB. Run: npx tsx scripts/verify-c7-procurement-catalog-ux.ts
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { ProcurementProductView } from "../lib/services/procurement-product.service";
import type { ProductCandidateSlot, ProductSelection } from "../lib/product-engine/product-intelligence";

const ROOT = path.resolve(__dirname, "..");
/** Accepted C.6-B commit (current production baseline). */
const BASE = "7a6d764928be3cdb26ae61c61842518a79a26a25";
const PAGE = "app/(product)/procurement-products/page.tsx";
const MANAGER = "app/(product)/procurement-products/ProcurementCatalogManager.tsx";
const QUOTE_PAGE = "app/(product)/quote/page.tsx";
const PI = "lib/product-engine/product-intelligence.ts";
const VERIFIER = "scripts/verify-c7-procurement-catalog-ux.ts";
const KNOWN_UNRELATED_DIRTY = new Set([
  "lib/commercial/action-delivery/index.ts",
  "lib/payments/wechatProvider.ts",
  "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
  "login-gzip.html",
]);

let passed = 0;
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`ASSERT: ${message}`);
  passed += 1;
}
const out = (line: string) => console.log(line);
const json = (v: unknown) => JSON.stringify(v);
const git = (args: string) => execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8" });
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), "utf8");
const count = (s: string, needle: string) => s.split(needle).length - 1;
const decode = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<!-- -->/g, "");

type ManagerModule = typeof import("../app/(product)/procurement-products/ProcurementCatalogManager");
type PiModule = typeof import("../lib/product-engine/product-intelligence");

/* eslint-disable @typescript-eslint/no-require-imports */
const react = require("react") as typeof import("react");
const server = require("react-dom/server") as typeof import("react-dom/server");
const ui = require("../app/(product)/procurement-products/ProcurementCatalogManager") as ManagerModule;
const pi = require("../lib/product-engine/product-intelligence") as PiModule;
/* eslint-enable @typescript-eslint/no-require-imports */

const html = (el: React.ReactElement) => decode(server.renderToStaticMarkup(el));
const OPTIONS = pi.PROCUREMENT_PRODUCT_CATEGORY_OPTIONS;
const LIMITS = { maxCount: pi.MAX_PROCUREMENT_KEY_SPECS, maxLength: pi.MAX_PROCUREMENT_KEY_SPEC_LENGTH };
const ORG = "org_c7_e2e";

function view(id: string, category: string, brand: string, model: string, extra: Partial<ProcurementProductView> = {}): ProcurementProductView {
  return {
    id,
    category,
    brand,
    model,
    keySpecs: [],
    priceFact: null,
    revision: 1,
    active: true,
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...extra,
  };
}

const PRICE = {
  unitPrice: 38000,
  currency: "CNY" as const,
  sourceType: "supplier_quote" as const,
  sourceReference: "Q-C7-001",
  quotedAt: "2026-09-20",
  supplier: "华东供应商",
  taxStatus: "tax_included" as const,
  validUntil: "2026-12-31",
};
const T100 = view("pp_t100", "treadmill", "C7-E2E Brand", "T100", { keySpecs: ["最高速度 20km/h", "跑带 56cm"], priceFact: PRICE, revision: 3 });
const T200 = view("pp_t200", "treadmill", "C7-E2E Brand", "T200", { keySpecs: ["最高速度 22km/h"] });
const T300 = view("pp_t300", "treadmill", "C7-E2E Brand 2", "T300");
const RACK = view("pp_rack", "rack", "C7-E2E Brand", "R1");
const OLD = view("pp_old", "elliptical", "C7-E2E Brand", "E1", { active: false, revision: 2, priceFact: { ...PRICE, sourceType: "procurement_contract" } });
const PRODUCTS = [T100, T200, T300, RACK, OLD];

/* ───────── fetch mock ───────── */
type Call = { url: string; method: string; headers: Record<string, string>; body?: unknown };
function mockFetch(status: number, body: unknown, calls: Call[], opts: { throws?: boolean; nonJson?: boolean } = {}) {
  return (async (url: string, init: RequestInit = {}) => {
    calls.push({
      url,
      method: init.method ?? "GET",
      headers: { ...(init.headers as Record<string, string>) },
      body: typeof init.body === "string" ? JSON.parse(init.body) : init.body,
    });
    if (opts.throws) throw new Error("ECONNRESET internal socket detail");
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (opts.nonJson) throw new SyntaxError("Unexpected token < in JSON");
        return body;
      },
    } as Response;
  }) as typeof fetch;
}

/* ───────── G01 / G10 / G11 / G21–G23 / G26: scope ───────── */
function diffLines(file: string) {
  const diff = git(`diff -U0 ${BASE} -- "${file}"`).split(/\r?\n/);
  return {
    removed: diff.filter((l) => l.startsWith("-") && !l.startsWith("---")),
    added: diff.filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1)),
  };
}

function checkScope() {
  const tracked = git(`diff --name-only ${BASE}`).split(/\r?\n/).filter(Boolean).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(json(tracked.sort()) === json([QUOTE_PAGE, PI].sort()), `G01: tracked changes vs ${BASE.slice(0, 8)} = quote page + PI (got ${json(tracked)})`);
  const untracked = git("ls-files --others --exclude-standard").split(/\r?\n/).filter(Boolean).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(json(untracked.sort()) === json([MANAGER, PAGE, VERIFIER].sort()), `G01: new files = page + manager + verifier (got ${json(untracked)})`);

  const frozen = (paths: string[]) =>
    git(`diff --name-only ${BASE} -- ${paths.map((p) => `"${p}"`).join(" ")}`).split(/\r?\n/).filter(Boolean).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(frozen(["prisma"]).length === 0 && !untracked.some((f) => f.startsWith("prisma/")), "G10: Prisma schema / migrations untouched, no new migration");
  assert(frozen(["app/api", "lib/services", "lib/domain", "lib/organization", "lib/auth"]).length === 0, "G11: procurement API routes / service / domain / org / auth untouched");
  assert(frozen(["lib/budget", "lib/pdf", "lib/tender", "lib/commercial", "lib/entitlement", "lib/billing", "lib/subscription", "app/(product)/budget", "app/(product)/tender", "package.json", "package-lock.json"]).length === 0, "G22 / G23: Budget / PDF / Tender (C.3) / entitlement / packages untouched");
  const scripts = git(`diff --name-only ${BASE} -- scripts`).split(/\r?\n/).filter(Boolean);
  assert(scripts.length === 0, `scope: no frozen verifier modified (got ${json(scripts)})`);

  // PI: strictly additive presentation export directly after isProcurementProductCategory.
  const piDiff = diffLines(PI);
  assert(piDiff.removed.length === 0, `G21 / G26: product-intelligence.ts has no removed / changed lines (got ${json(piDiff.removed)})`);
  const added = piDiff.added.join("\n");
  assert(
    added.includes("export type ProcurementProductCategoryOption") &&
      added.includes("export const PROCUREMENT_PRODUCT_CATEGORY_OPTIONS") &&
      added.includes("Object.entries(SLOT_SKU_CATEGORIES)"),
    "G13: PI addition is the category-option presentation export derived from SLOT_SKU_CATEGORIES",
  );
  assert(!/function |MAX_SLOT_CANDIDATES|priceFact|quantity|validate|merge|build|sort\(|splice|push\(/.test(added), "G21 / G26: PI addition has no function / ranking / limit / price / quantity / merge logic");
  const piSrc = read(PI);
  const basePi = git(`show ${BASE}:${PI}`);
  assert(piSrc.includes("const MAX_SLOT_CANDIDATES = 3;") && basePi.includes("const MAX_SLOT_CANDIDATES = 3;"), "G21: MAX_SLOT_CANDIDATES unchanged (3)");
  out("✓ G01 / G10 / G11 / G22 / G23: tracked = quote page + PI; new = page + manager + verifier; prisma / app/api / lib/services / Budget / PDF / Tender / packages / frozen verifiers untouched");
  out("✓ G21 / G26: product-intelligence.ts diff is additive-only presentation metadata (no removed lines, no logic)");
}

/* ───────── G02–G05: page / organization / authorization ───────── */
function checkPage() {
  const page = read(PAGE);
  assert(fs.existsSync(path.join(ROOT, PAGE)) && /export default async function ProcurementProductsPage\(/.test(page), "G02: /procurement-products server page exists");
  assert(page.includes('export const dynamic = "force-dynamic";') && page.includes('export const runtime = "nodejs";') && !page.includes('"use client"'), "G02: dynamic Node server component");
  assert(/const user = await getCurrentUser\(\);\s*if \(!user\) \{\s*redirect\("\/login"\);/.test(page), "G03: unauthenticated → /login");
  assert(page.includes("const org = await resolveExactSingleOrganizationForUser(user.id);") && page.includes("organizationId={org.organizationId}"), "G03: organization resolved server-side and passed to the manager");
  assert(page.includes("{org.ok ? (") && page.includes("无法确定当前组织，暂不能查看组织采购库。"), "G03: no organization → fixed fallback, no manager");
  assert(page.includes("const canManage = org.ok && canManageProcurementProducts(org.role);") && page.includes('from "@/app/api/procurement-products/shared"'), "G04: canManage uses the API's own OWNER/ADMIN predicate");
  assert(page.includes("{org.ok && !canManage ? (") && page.includes("当前账号为只读：仅组织所有者或管理员可新增、编辑或停用。"), "G05: read-only notice for other members");
  assert(page.includes('from "@/lib/product-engine/product-intelligence"') && page.includes("categoryOptions={PROCUREMENT_PRODUCT_CATEGORY_OPTIONS}"), "G13: page passes the shared PI options");
  assert(!/prisma|fetch\(/.test(page), "G03: page performs no direct DB / fetch work beyond org resolution");

  const shared = read("app/api/procurement-products/shared.ts");
  assert(/return normalized === "OWNER" \|\| normalized === "ADMIN";/.test(shared), "G04: shared predicate = OWNER | ADMIN");

  // Manager-level gating (SSR initial render; effects do not run).
  const props = { organizationId: ORG, categoryOptions: OPTIONS, keySpecLimits: LIMITS };
  const owner = html(react.createElement(ui.ProcurementCatalogManager, { ...props, canManage: true }));
  const member = html(react.createElement(ui.ProcurementCatalogManager, { ...props, canManage: false }));
  assert(owner.includes("新增产品") && owner.includes("显示已停用产品"), "G04: OWNER/ADMIN see 新增产品 + 显示已停用产品");
  assert(!member.includes("新增产品") && !member.includes("显示已停用产品"), "G05: member sees no create / include-inactive controls");
  const managerSrc = read(MANAGER);
  assert(managerSrc.includes("const showInactive = canManage && includeInactive;"), "G05 / G18: includeInactive is only requested for managers");
  assert(managerSrc.includes("{canManage && form ? (") && managerSrc.includes("{canManage && confirming ? ("), "G05: form / confirm only render for managers");

  // List-level gating.
  const list = (canManage: boolean) => html(react.createElement(ui.ProcurementCatalogList, { products: PRODUCTS, categoryOptions: OPTIONS, canManage }));
  const ownerList = list(true);
  const memberList = list(false);
  const activeCount = PRODUCTS.filter((p) => p.active).length;
  assert(count(ownerList, ">编辑</button>") === activeCount && count(ownerList, ">停用</button>") === activeCount, "G04: edit / deactivate on every active product for managers");
  assert(!memberList.includes(">编辑</button>") && !memberList.includes(">停用</button>"), "G05: member list is read-only");
  assert(memberList.includes("C7-E2E Brand T100") && memberList.includes("已核实采购价 ¥38,000 · 供应商报价"), "G05: member still reads products and verified price");
  out("✓ G02–G05: server page (login redirect, exact single org, OWNER/ADMIN via shared predicate, read-only notice); manager / list controls gated by canManage");
}

/* ───────── G06–G09 / G16 / G24 / G25: API reuse + errors ───────── */
async function checkApi() {
  const route = read("app/api/procurement-products/route.ts");
  const idRoute = read("app/api/procurement-products/[id]/route.ts");
  assert(/export async function GET\(/.test(route) && /export async function POST\(/.test(route), "G06 / G07: GET / POST route exists");
  assert(/export async function PATCH\(/.test(idRoute) && /export async function DELETE\(/.test(idRoute), "G08 / G09: PATCH / DELETE [id] route exists");
  assert(ui.PROCUREMENT_PRODUCTS_API === "/api/procurement-products", "G06: endpoint constant");

  let calls: Call[] = [];
  const listed = await ui.loadProcurementProducts(ORG, false, mockFetch(200, { ok: true, products: [T100, T200, { bad: 1 }] }, calls));
  assert(listed.ok && listed.value.length === 2, "G06: GET returns the product views (malformed rows dropped)");
  assert(json(calls) === json([{ url: "/api/procurement-products", method: "GET", headers: { "x-organization-id": ORG } }]), `G06: GET ${json(calls)}`);
  calls = [];
  await ui.loadProcurementProducts(ORG, true, mockFetch(200, { ok: true, products: [] }, calls));
  assert(calls[0].url === "/api/procurement-products?includeInactive=1" && calls[0].method === "GET", "G06 / G18: includeInactive=1 for managers");

  const draft = { ...ui.emptyProcurementProductDraft("treadmill"), brand: "C7-E2E Brand", model: "T100", keySpecsText: "最高速度 20km/h\n\n 跑带 56cm " };
  const noPrice = ui.validateProcurementProductDraft(draft, OPTIONS, LIMITS);
  assert(noPrice.ok && noPrice.body.priceFact === null && json(noPrice.body.keySpecs) === json(["最高速度 20km/h", "跑带 56cm"]), "G14: identity-only body, one key spec per line");
  calls = [];
  const created = await ui.createProcurementProduct(ORG, noPrice.body, mockFetch(201, { ok: true, product: T100 }, calls));
  assert(created.ok && created.value.id === "pp_t100", "G07: POST returns the created product");
  assert(calls[0].url === "/api/procurement-products" && calls[0].method === "POST" && calls[0].headers["x-organization-id"] === ORG && calls[0].headers["Content-Type"] === "application/json", "G07: POST endpoint / headers");
  assert(json(calls[0].body) === json({ category: "treadmill", brand: "C7-E2E Brand", model: "T100", keySpecs: ["最高速度 20km/h", "跑带 56cm"] }), `G07: POST without price omits priceFact (got ${json(calls[0].body)})`);

  const withPrice = ui.validateProcurementProductDraft(
    { ...draft, includePrice: true, unitPrice: "38000", sourceReference: " Q-C7-001 ", quotedAt: "2026-09-20", supplier: "华东供应商", taxStatus: "tax_included", validUntil: "2026-12-31" },
    OPTIONS,
    LIMITS,
  );
  assert(withPrice.ok && json(withPrice.body.priceFact) === json(PRICE), `G15: priceFact body (got ${withPrice.ok ? json(withPrice.body.priceFact) : withPrice.error})`);
  calls = [];
  await ui.createProcurementProduct(ORG, withPrice.body, mockFetch(201, { ok: true, product: T100 }, calls));
  assert(json((calls[0].body as { priceFact: unknown }).priceFact) === json(PRICE), "G07 / G15: POST with price carries priceFact");

  // G08 / G16: PATCH with the full body; clearing sends priceFact:null.
  const editDraft = ui.draftFromProcurementProduct(T100);
  assert(editDraft.includePrice && editDraft.unitPrice === "38000" && editDraft.sourceReference === "Q-C7-001" && editDraft.keySpecsText === "最高速度 20km/h\n跑带 56cm", "G08: edit draft prefilled from the stored product");
  const cleared = ui.validateProcurementProductDraft({ ...editDraft, includePrice: false }, OPTIONS, LIMITS);
  assert(cleared.ok && cleared.body.priceFact === null, "G16: unticking the price yields priceFact null");
  calls = [];
  const patched = await ui.updateProcurementProduct(ORG, "pp/t100", cleared.body, mockFetch(200, { ok: true, product: { ...T100, priceFact: null, revision: 4 } }, calls));
  assert(patched.ok && patched.value.revision === 4, "G08: PATCH returns the updated product");
  assert(calls[0].url === "/api/procurement-products/pp%2Ft100" && calls[0].method === "PATCH" && calls[0].headers["x-organization-id"] === ORG, "G08: PATCH /api/procurement-products/:id (encoded)");
  assert(Object.prototype.hasOwnProperty.call(calls[0].body, "priceFact") && (calls[0].body as { priceFact: unknown }).priceFact === null, "G16: PATCH body contains priceFact: null");
  const formHtml = html(react.createElement(ui.ProcurementProductForm, { mode: "edit", draft: { ...editDraft, includePrice: false }, categoryOptions: OPTIONS, limits: LIMITS, hadPriceFact: true }));
  assert(formHtml.includes("保存后将清除该产品已登记的核实采购价"), "G16: explicit clear warning when a stored price will be removed");

  calls = [];
  const deactivated = await ui.deactivateProcurementProduct(ORG, "pp_t200", mockFetch(200, { ok: true, product: { ...T200, active: false } }, calls));
  assert(deactivated.ok && deactivated.value.active === false, "G09: DELETE returns the deactivated product");
  assert(json(calls) === json([{ url: "/api/procurement-products/pp_t200", method: "DELETE", headers: { "x-organization-id": ORG } }]), `G09: DELETE without body (got ${json(calls)})`);

  const managerSrc = read(MANAGER);
  const methods = [...managerSrc.matchAll(/method: "([A-Z]+)"/g)].map((m) => m[1]).sort();
  assert(json(methods) === json(["DELETE", "PATCH", "POST"]), `G06–G09: only POST / PATCH / DELETE (+ default GET) issued (got ${json(methods)})`);
  assert(!/\/api\/(?!procurement-products)/.test(managerSrc) && count(managerSrc, "fetcher(") === 1, "G06–G09: manager calls no other API");

  // G24 / G25: fixed Chinese error mapping; server text never surfaces.
  const SECRET = "PrismaClientKnownRequestError at /srv/app internal stack";
  const cases: Array<[number, string, string]> = [
    [400, "PROCUREMENT_PRODUCT_INVALID", "产品数据无效"],
    [409, "PROCUREMENT_PRODUCT_DUPLICATE", "已存在相同品牌与型号的启用产品"],
    [409, "PROCUREMENT_PRODUCT_INACTIVE", "该产品已停用，不能修改。"],
    [409, "PROCUREMENT_PRODUCT_CONCURRENT_UPDATE", "已被其他操作修改或停用"],
    [404, "PROCUREMENT_PRODUCT_NOT_FOUND", "不存在或不属于当前组织"],
    [400, "PROCUREMENT_PRODUCT_ID_REQUIRED", "缺少产品标识"],
    [403, "PROCUREMENT_PRODUCT_FORBIDDEN", "仅组织所有者或管理员可维护采购库产品"],
  ];
  for (const [status, code, expected] of cases) {
    const res = await ui.updateProcurementProduct(ORG, "x", noPrice.body, mockFetch(status, { ok: false, code, message: SECRET }, []));
    assert(!res.ok && res.error.includes(expected) && !res.error.includes(SECRET), `G24: ${code} → fixed copy`);
  }
  assert(ui.procurementProductErrorMessage(401, null, "load") === "登录已失效，请重新登录后重试。", "G24: 401 fixed copy");
  assert(ui.procurementProductErrorMessage(403, {}, "load").startsWith("权限不足"), "G24: 403 without code fixed copy");
  const fallbacks = { load: "组织采购库加载失败，请稍后重试。", create: "新增失败，请稍后重试。", update: "保存失败，请稍后重试。", deactivate: "停用失败，请稍后重试。" } as const;
  for (const [action, expected] of Object.entries(fallbacks) as Array<[keyof typeof fallbacks, string]>) {
    assert(ui.procurementProductErrorMessage(500, { ok: false, message: SECRET, traceId: "t" }, action) === expected, `G25: 500 ${action} → fixed fallback`);
  }
  const raw500 = await ui.loadProcurementProducts(ORG, false, mockFetch(500, { ok: false, message: SECRET, error: "Internal Server Error" }, []));
  const html500 = await ui.createProcurementProduct(ORG, noPrice.body, mockFetch(500, null, [], { nonJson: true }));
  const net = await ui.deactivateProcurementProduct(ORG, "x", mockFetch(0, null, [], { throws: true }));
  const okButMalformed = await ui.updateProcurementProduct(ORG, "x", noPrice.body, mockFetch(200, { ok: true }, []));
  assert(!raw500.ok && raw500.error === fallbacks.load, "G25: raw 500 JSON → fixed load fallback");
  assert(!html500.ok && html500.error === fallbacks.create, "G25: non-JSON 500 page → fixed create fallback");
  assert(!net.ok && net.error === "网络异常，请检查网络后重试。" && !net.error.includes("ECONNRESET"), "G25: network error → fixed copy");
  assert(!okButMalformed.ok && okButMalformed.error === fallbacks.update, "G25: malformed success body → fixed fallback");
  for (const r of [raw500, html500, net, okButMalformed]) {
    assert(!r.ok && !/500|Internal|Error|Prisma|stack/i.test(r.error), "G25: no raw status / server text shown");
  }
  assert(!/\.message\b|body\.error|\.error\)/.test(managerSrc.slice(managerSrc.indexOf("export function procurementProductErrorMessage"), managerSrc.indexOf("type Fetcher"))), "G25: mapper never reads server message / error fields");
  out(`✓ G06–G09: GET (+includeInactive=1) / POST (priceFact omitted when absent) / PATCH (full body, encoded id) / DELETE (no body) on the unchanged endpoint with x-organization-id`);
  out(`✓ G16 / G24 / G25: PATCH priceFact:null clears with explicit warning; ${cases.length} API codes + 401/403 + per-action 500 / non-JSON / network fallbacks are fixed Chinese copy, no server text`);
}

/* ───────── G12 / G13 / G14 / G15 / G17 / G18 / G21 / G26: catalog UX + multi-model ───────── */
function checkCatalog() {
  // G13: shared taxonomy.
  assert(json(OPTIONS.map((o) => o.category)) === json(pi.PROCUREMENT_PRODUCT_CATEGORIES), "G13: option categories = PI PROCUREMENT_PRODUCT_CATEGORIES (same order)");
  assert(
    json(OPTIONS.map((o) => [o.category, o.label])) ===
      json([
        ["treadmill", "商业级跑步机"],
        ["elliptical", "椭圆机"],
        ["strength", "综合训练器"],
        ["rack", "自由力量区设备（力量架类）"],
        ["free_weight", "自由力量区设备（自由重量）"],
      ]),
    `G13: labels (rack / free_weight distinguished) (got ${json(OPTIONS.map((o) => o.label))})`,
  );
  assert(new Set(OPTIONS.map((o) => o.label)).size === OPTIONS.length && OPTIONS.every((o) => pi.isProcurementProductCategory(o.category)), "G13: labels unique; every option accepted by the service category check");
  const managerSrc = read(MANAGER);
  assert(!/"(treadmill|elliptical|strength|rack|free_weight)"/.test(managerSrc) && !managerSrc.includes("SLOT_SKU_CATEGORIES"), "G13: manager hard-codes no taxonomy");
  assert(/^import type \{ ProcurementProductCategoryOption \} from "@\/lib\/product-engine\/product-intelligence";$/m.test(managerSrc) && /^import type \{ ProcurementProductView \} from "@\/lib\/services\/procurement-product.service";$/m.test(managerSrc), "G13: client imports PI / service as types only (no server bundle)");

  // G12: multi-model coexistence (UI + PI adaptation).
  const drafts = [T100, T200, T300].map((p) => ui.validateProcurementProductDraft({ ...ui.emptyProcurementProductDraft("treadmill"), brand: p.brand, model: p.model }, OPTIONS, LIMITS));
  assert(drafts.every((d) => d.ok), "G12: T100 / T200 / T300 all valid drafts (no client uniqueness rule)");
  assert(!/identityKey|toLowerCase|toUpperCase|localeCompare/.test(managerSrc), "G12: no client-side identity / uniqueness logic stricter than the service");
  const groups = ui.groupProcurementProducts(PRODUCTS, OPTIONS);
  const treadmill = groups.find((g) => g.category === "treadmill")!;
  assert(json(treadmill.products.map((p) => `${p.brand}/${p.model}`)) === json(["C7-E2E Brand/T100", "C7-E2E Brand/T200", "C7-E2E Brand 2/T300"]), "G12: three treadmill models grouped together in order");
  assert(json(groups.map((g) => g.category)) === json(OPTIONS.map((o) => o.category)), "G12: groups follow the shared option order");
  const unknown = ui.groupProcurementProducts([view("pp_x", "bike", "B", "X")], OPTIONS);
  assert(unknown.at(-1)?.label === "未识别品类（bike）", "G12: unknown category still shown, never dropped");

  const listHtml = html(react.createElement(ui.ProcurementCatalogList, { products: PRODUCTS, categoryOptions: OPTIONS, canManage: true }));
  assert(listHtml.includes("商业级跑步机 · 3 个产品") && listHtml.includes("自由力量区设备（力量架类） · 1 个产品") && listHtml.includes("自由力量区设备（自由重量） · 0 个产品"), "G12 / G13: grouped headings with counts");
  assert(count(listHtml, "暂无产品") === 2, "G12: empty groups show 暂无产品");

  const PROC = PRODUCTS.map((p) => ({ id: p.id, category: p.category, brand: p.brand, model: p.model, keySpecs: p.keySpecs, priceFact: p.priceFact, revision: p.revision }));
  const refs = ["r1", "r2", "r3"].map((id) => ({ candidateId: id, brand: "Ref", model: id, category: "商业级跑步机", keySpecs: [], fitReason: "", source: "reference-catalog" as const, verificationStatus: "unverified" as const, openQuestions: [] }));
  const slot: ProductCandidateSlot = { slotKey: "有氧设备|商业级跑步机", category: "有氧设备", subCategory: "商业级跑步机", templateQuantity: 4, priceBand: "mid", candidates: refs };
  const options = pi.buildProcurementCandidateOptions(PROC.filter((p) => p.id !== "pp_old"), [slot]);
  assert(json(options.map((o) => o.candidate.candidateId)) === json(["proc:pp_t100:r3", "proc:pp_t200:r1", "proc:pp_t300:r1"]), `G12: PI offers all three treadmill models (got ${json(options.map((o) => o.candidate.candidateId))})`);
  assert(json(options[0].priceFact) === json(PRICE) && options[1].priceFact === undefined && options[2].priceFact === undefined, "G12 / G15: only T100's verified price travels with its option");
  const merged = pi.mergeProcurementCandidates([slot], options, []);
  assert(json(merged[0].candidates.map((c) => c.candidateId)) === json(["r1", "r2", "r3", "proc:pp_t100:r3", "proc:pp_t200:r1", "proc:pp_t300:r1"]), "G12 / G21: 3 reference candidates first, all procurement candidates appended (limit / ranking unchanged)");

  // G26: historical snapshot untouched by later edits / deactivation.
  const historical: ProductSelection = { slotKey: slot.slotKey, action: "replace", candidate: { ...options[1].candidate, candidateId: "proc:pp_t200:r1" }, decidedAt: "2026-09-01T00:00:00.000Z" };
  const afterEdit = pi.buildProcurementCandidateOptions(PROC.filter((p) => p.id !== "pp_old" && p.id !== "pp_t200").concat([{ ...PROC[1], revision: 2 }]), [slot]);
  const slotsBefore = json([slot]);
  const mergedHist = pi.mergeProcurementCandidates([slot], afterEdit, [historical]);
  assert(mergedHist[0].candidates.some((c) => c.candidateId === "proc:pp_t200:r1") && mergedHist[0].candidates.some((c) => c.candidateId === "proc:pp_t200:r2"), "G26: stored r1 snapshot kept alongside the edited r2 candidate");
  const withoutT200 = pi.mergeProcurementCandidates([slot], options.filter((o) => !o.candidate.candidateId.startsWith("proc:pp_t200")), [historical]);
  assert(withoutT200[0].candidates.some((c) => c.candidateId === "proc:pp_t200:r1"), "G26: deactivated product's stored snapshot still shown for its selection");
  assert(json([slot]) === slotsBefore, "G26: merge never mutates the stored slots");

  // G14 / G15: identity and verified price kept apart.
  const createForm = html(react.createElement(ui.ProcurementProductForm, { mode: "create", draft: ui.emptyProcurementProductDraft("treadmill"), categoryOptions: OPTIONS, limits: LIMITS }));
  const identityAt = createForm.indexOf("<legend");
  const priceAt = createForm.indexOf("核实采购价（可选）</legend>");
  assert(createForm.includes(">产品身份</legend>") && identityAt < priceAt, "G14: 产品身份 fieldset before 核实采购价（可选）");
  const identity = createForm.slice(identityAt, priceAt);
  for (const field of ["设备子品类", "品牌", "型号", `关键参数（每行一项，最多 ${LIMITS.maxCount} 项）`, "参数未核实"]) {
    assert(identity.includes(field), `G14: identity field ${field}`);
  }
  for (const o of OPTIONS) assert(identity.includes(`<option value="${o.category}"`) && identity.includes(`>${o.label}</option>`), `G13 / G14: category option ${o.label}`);
  assert(!identity.includes("单价") && !identity.includes("已核实"), "G14: identity section never mentions price / 已核实");
  assert(!createForm.includes("核实单价（元，CNY）"), "G15: price fields hidden until opted in (optional)");
  const priceForm = html(react.createElement(ui.ProcurementProductForm, { mode: "create", draft: { ...ui.emptyProcurementProductDraft("treadmill"), includePrice: true }, categoryOptions: OPTIONS, limits: LIMITS }));
  for (const field of ["核实单价（元，CNY）", "价格来源类型", ">供应商报价</option>", ">采购合同</option>", "来源凭据（报价单号 / 合同号）", "报价日期", "供应商（可选）", "含税状态（可选）", ">含税</option>", ">不含税</option>", "有效期至（可选）"]) {
    assert(priceForm.slice(priceForm.indexOf("核实采购价（可选）")).includes(field), `G15: price field ${field}`);
  }

  const base = { ...ui.emptyProcurementProductDraft("treadmill"), brand: "B", model: "M", includePrice: true, unitPrice: "100", sourceReference: "Q", quotedAt: "2026-09-01" };
  const rejects: Array<[Record<string, unknown>, string]> = [
    [{ category: "bike" }, "子品类"],
    [{ brand: "  " }, "品牌"],
    [{ model: "" }, "型号"],
    [{ brand: "A\u0007" }, "控制字符"],
    [{ unitPrice: "0" }, "核实单价"],
    [{ unitPrice: "12.345" }, "核实单价"],
    [{ unitPrice: "-1" }, "核实单价"],
    [{ sourceType: "invoice" }, "来源类型"],
    [{ sourceReference: " " }, "来源凭据"],
    [{ quotedAt: "2026/09/01" }, "报价日期"],
    [{ validUntil: "2026-08-31" }, "有效期"],
    [{ taxStatus: "vat" }, "含税状态"],
    [{ includePrice: false, keySpecsText: Array.from({ length: LIMITS.maxCount + 1 }, (_, i) => `spec ${i}`).join("\n") }, "关键参数最多"],
    [{ includePrice: false, keySpecsText: "x".repeat(LIMITS.maxLength + 1) }, "每项关键参数"],
  ];
  for (const [patch, expected] of rejects) {
    const res = ui.validateProcurementProductDraft({ ...base, ...patch } as never, OPTIONS, LIMITS);
    assert(!res.ok && res.error.includes(expected), `G14 / G15: client rejects ${json(patch).slice(0, 40)} → ${expected}`);
  }
  const contract = ui.validateProcurementProductDraft({ ...base, sourceType: "procurement_contract", unitPrice: "12.5" }, OPTIONS, LIMITS);
  assert(contract.ok && json(contract.body.priceFact) === json({ unitPrice: 12.5, currency: "CNY", sourceType: "procurement_contract", sourceReference: "Q", quotedAt: "2026-09-01" }), "G15: minimal procurement_contract priceFact (optional fields omitted)");

  // List price status wording.
  const item = (id: string) => listHtml.match(new RegExp(`<li data-product-id="${id}"[^>]*>([\\s\\S]*?)</li>`))?.[1] ?? "";
  const t100 = item("pp_t100");
  const t200 = item("pp_t200");
  assert(t100.includes("C7-E2E Brand T100") && t100.includes("第 3 版") && t100.includes("启用中") && t100.includes("产品身份（参数未核实）：最高速度 20km/h · 跑带 56cm"), "G14: list shows label / revision / active / unverified identity");
  assert(t100.includes("已核实采购价 ¥38,000 · 供应商报价") && t100.includes("报价日期 2026-09-20 · 供应商 华东供应商 · 含税 · 有效期至 2026-12-31"), "G15: verified price headline + facts");
  assert(t200.includes("未提供核实采购价") && !t200.includes("已核实") && !t200.includes("¥"), "G15: product without price is never called 已核实");
  assert(item("pp_t300").includes("未登记关键参数"), "G14: empty key specs labelled");
  assert(ui.purchasePriceSummary(null).headline === ui.NO_VERIFIED_PURCHASE_PRICE_TEXT && ui.NO_VERIFIED_PURCHASE_PRICE_TEXT === "未提供核实采购价" && ui.VERIFIED_PURCHASE_PRICE_TEXT === "已核实采购价", "G15: verified / unverified wording constants");
  assert(ui.formatPurchasePrice(1234567.5) === "¥1,234,567.5", "G15: CNY formatting");

  // G17 / G18: deactivation + inactive lifecycle.
  const confirm = html(react.createElement(ui.DeactivateProcurementProductConfirm, { product: T200 }));
  assert(json(ui.DEACTIVATE_NOTICE) === json(["停用后该产品不会再出现在新的方案候选中。", "已有方案和预算快照不会改变。", "当前版本不支持直接重新启用；如需恢复需重新新增。"]), "G17: exact deactivation copy");
  assert(confirm.includes("确认停用 C7-E2E Brand T200？") && ui.DEACTIVATE_NOTICE.every((l) => confirm.includes(l)) && confirm.includes(">确认停用</button>") && confirm.includes(">取消</button>"), "G17: explicit confirm dialog with copy + confirm / cancel");
  assert(/onDeactivate=\{\(product\) => \{\s*setNotice\(null\);\s*setConfirming\(product\);/.test(managerSrc) && managerSrc.includes("onConfirm={() => void deactivate()}"), "G17: 停用 only opens the confirmation; DELETE runs on 确认停用");
  const old = item("pp_old");
  assert(old.includes("已停用") && !old.includes(">编辑</button>") && !old.includes(">停用</button>"), "G18: inactive product shown as 已停用 without edit / deactivate");
  assert(old.includes("已核实采购价 ¥38,000 · 采购合同"), "G18: inactive product keeps its recorded facts for reference");
  assert(!/重新启用<\/button>|active: true|reactivate/i.test(managerSrc) && !managerSrc.includes('"PUT"'), "G18: no reactivation / physical delete path");
  out("✓ G12: T100 / T200 (C7-E2E Brand) + T300 (C7-E2E Brand 2) coexist in UI grouping and the unchanged PI candidate adaptation (3 refs + 3 procurement)");
  out("✓ G13–G15 / G17 / G18 / G26: shared taxonomy (rack / free_weight distinguished); 产品身份 ≠ 核实采购价; verified vs 未提供核实采购价; exact deactivation copy + confirmation; inactive read-only; snapshots untouched");
}

/* ───────── G19 / G20: Quote ───────── */
function checkQuote() {
  const quote = read(QUOTE_PAGE);
  const { removed, added } = diffLines(QUOTE_PAGE);
  assert(removed.length === 0, `G19: quote page has no removed lines (got ${json(removed)})`);
  assert(
    json(added.map((l) => l.trim())) ===
      json(['<p className="text-xs text-zinc-400">', '<Link href="/procurement-products" className="underline hover:text-zinc-200">', "管理组织采购库", "</Link>", "</p>"]),
    `G19: quote addition is exactly the low-key link (got ${json(added)})`,
  );
  const stepAt = quote.indexOf("第 4 步：产品配置");
  const linkAt = quote.indexOf('href="/procurement-products"');
  const procNoteAt = quote.indexOf("组织采购库中登记的产品标注「采购库产品 / 参数未核实」");
  assert(stepAt > 0 && procNoteAt > stepAt && linkAt > procNoteAt && count(quote, 'href="/procurement-products"') === 1, "G19: single link inside 第 4 步：产品配置, right after the procurement note");
  assert(!/bg-|font-(semibold|bold)|button|onClick/.test(added.join("\n")), "G19: no competing primary CTA styling / handler");
  assert(/^import Link from "next\/link";$/m.test(quote), "G19: existing next/link import reused");

  const piSrc = read(PI);
  const candidateType = piSrc.slice(piSrc.indexOf("export type ProductCandidate = {"), piSrc.indexOf("export type ProductSelectionAction"));
  assert(candidateType.length > 0 && !candidateType.includes("priceFact"), "G20: ProductCandidate carries no priceFact → Quote candidate price badge deferred");
  assert(!/已核实采购价|未提供核实采购价|priceFact/.test(added.join("\n")), "G20: no Quote price badge / contract field added");
  out("✓ G19 / G20: Quote gains one low-key 「管理组织采购库」 link in 第 4 步 (no CTA / flow change); candidate price badge deferred (ProductCandidate has no priceFact)");
}

(async () => {
  try {
    checkScope();
    checkPage();
    await checkApi();
    checkCatalog();
    checkQuote();
    out(`\nC.7 Organization Procurement Catalog UX: PASS (${passed} assertions)`);
  } catch (err) {
    console.error(err instanceof Error ? err.stack : err);
    process.exit(1);
  }
})();
