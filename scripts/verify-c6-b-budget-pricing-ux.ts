/**
 * Product Core v2 — C.6-B Budget Pricing UX Clarity verifier.
 *
 * Presentation-only WP on top of the accepted C.6-A commit. Asserts:
 *  - classification / counts / C.1 labels are identical to the C.6-A helper (only the VERIFIED label text changes);
 *  - the 价格依据 panel keeps every C.6-A text contract contiguous and adds restrained per-source styling;
 *  - pricing text is ≥ text-sm and never text-zinc-500;
 *  - the Budget page adds one secondary 「管理组织估算价目表 →」 link and nothing else (no fetch / flow / CTA change);
 *  - scope is exactly the two UI files + this verifier.
 *
 * Run: npx tsx scripts/verify-c6-b-budget-pricing-ux.ts
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import type { BudgetItem } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
/** Accepted C.6-A commit (product-c6-a-organization-estimate-price-reference-production-accepted). */
const C6A = "2d501f835aeda072be334fa88ac3d4af2ef08164";
/** C.6-A's own baseline; the frozen C.6-A verifier diffs the Budget page against it. */
const C6A_BASELINE = "5bc60fb8";
const UI_PRICE_BASIS = "app/(product)/budget/price-basis.tsx";
const UI_BUDGET_PAGE = "app/(product)/budget/page.tsx";
const VERIFIER = "scripts/verify-c6-b-budget-pricing-ux.ts";
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
const count = (s: string, needle: string) => s.split(needle).length - 1;
const decode = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

type PriceBasisModule = typeof import("../app/(product)/budget/price-basis");

function loadC6aPriceBasis(): PriceBasisModule {
  const js = ts.transpileModule(git(`show ${C6A}:${UI_PRICE_BASIS}`), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  const fn = vm.runInThisContext(`(function (exports, require, module) {${js}\n})`) as (
    exports: Record<string, unknown>,
    require: NodeJS.Require,
    module: { exports: Record<string, unknown> },
  ) => void;
  fn(mod.exports, require, mod);
  return mod.exports as unknown as PriceBasisModule;
}

/* eslint-disable @typescript-eslint/no-require-imports */
const react = require("react") as typeof import("react");
const server = require("react-dom/server") as typeof import("react-dom/server");
const priceBasis = require("../app/(product)/budget/price-basis") as PriceBasisModule;
/* eslint-enable @typescript-eslint/no-require-imports */
const c6aPriceBasis = loadC6aPriceBasis();
const panelHtml = (mod: PriceBasisModule, items: readonly BudgetItem[]) =>
  decode(server.renderToStaticMarkup(react.createElement(mod.BudgetPriceBasisPanel, { items })));

const NOTE_120 = `UI-C6B-${"华东采购参考 & '供应商' ".repeat(20)}`.slice(0, 120);
function row(name: string, category: string, extra: Partial<BudgetItem> & Record<string, unknown>, min: number, max: number): BudgetItem {
  return {
    category,
    name,
    specLevel: "standard",
    quantity: 2,
    unitPriceMin: min,
    unitPriceMax: max,
    subtotalMin: min * 2,
    subtotalMax: max * 2,
    sourceType: "placeholder",
    priceBasis: "ESTIMATE",
    ...extra,
  } as BudgetItem;
}
const orgBasis = (revision: unknown, sourceNote: unknown) => ({ source: "organization-price-reference", revision, sourceNote });
const ITEMS: BudgetItem[] = [
  row("商用跑步机", "有氧设备", { priceBasis: "VERIFIED", sourceType: "sku", estimateBasis: orgBasis(4, "ignored: VERIFIED wins") as never }, 38000, 42000),
  row("椭圆机", "有氧设备", { priceBasis: "VERIFIED", sourceType: "sku" }, 21000, 23000),
  row("多功能综合训练器", "力量设备", { estimateBasis: orgBasis(2, NOTE_120) as never }, 30000, 50000),
  row("储物柜", "配套家具", { estimateBasis: orgBasis(7, "  2026 Q3 华东采购参考  ") as never }, 1200, 1800),
  row("瑜伽垫", "瑜伽垫上设备", {}, 80, 160),
  row("", "配套设施", { priceBasis: undefined }, 500, 900),
  row("哑铃组", "力量设备", { estimateBasis: orgBasis(0, "revision 0 → platform") as never }, 6000, 9000),
  row("划船机", "有氧设备", { estimateBasis: orgBasis("3", "string revision → platform") as never }, 8000, 12000),
  row("拉伸架", "功能训练设备", { estimateBasis: [] as never }, 2000, 3000),
];
const EXPECTED = { VERIFIED: 2, ORGANIZATION_ESTIMATE: 2, PLATFORM_ESTIMATE: 5 };

function checkSemanticsUnchanged() {
  const fixtures: BudgetItem[][] = [ITEMS, [], [ITEMS[0]], [ITEMS[2], ITEMS[3]], ITEMS.slice(4)];
  for (const items of fixtures) {
    assert(json(priceBasis.countBudgetPriceBasis(items)) === json(c6aPriceBasis.countBudgetPriceBasis(items)), "semantics: counts identical to C.6-A");
    for (const item of items) {
      const basis = priceBasis.budgetItemPriceBasis(item);
      assert(json(basis) === json(c6aPriceBasis.budgetItemPriceBasis(item)), `semantics: classification identical to C.6-A (${item.name || item.category})`);
      const text = priceBasis.budgetItemPriceBasisText(basis);
      const c6aText = c6aPriceBasis.budgetItemPriceBasisText(basis);
      assert(basis.kind === "VERIFIED" ? c6aText === "核实单价" && text === "已核实单价" : text === c6aText, `semantics: basis text unchanged except VERIFIED label (${item.name || item.category})`);
      for (const optionBasis of ["VERIFIED", "ESTIMATE", undefined] as const) {
        assert(
          priceBasis.reductionOptionPriceBasisLabel(optionBasis, item) === c6aPriceBasis.reductionOptionPriceBasisLabel(optionBasis, item),
          "semantics: C.1 option label identical to C.6-A",
        );
      }
    }
  }
  assert(json(priceBasis.countBudgetPriceBasis(ITEMS)) === json(EXPECTED), `fixture: mixed Budget counts (got ${json(priceBasis.countBudgetPriceBasis(ITEMS))})`);
  assert(
    json(priceBasis.BUDGET_PRICE_BASIS_LABEL) === json({ ...c6aPriceBasis.BUDGET_PRICE_BASIS_LABEL, VERIFIED: "已核实单价" }),
    "UX 1: VERIFIED label 「已核实单价」, other labels unchanged",
  );
  out("✓ semantics: classification / counts / C.1 option labels identical to the accepted C.6-A helper; only the VERIFIED label text becomes 「已核实单价」");
}

function checkPanel() {
  const panel = panelHtml(priceBasis, ITEMS);
  const c6aPanel = panelHtml(c6aPriceBasis, ITEMS);

  // C.6-A text contracts (frozen verifier AC-UI 7–9) stay contiguous.
  assert(panel.includes("已核实单价：2 项") && panel.includes("核实单价：2 项"), "C.6-A AC-UI 7: VERIFIED count contiguous");
  assert(panel.includes("组织价目估算：2 项") && panel.includes(`平台通用估算：${EXPECTED.PLATFORM_ESTIMATE} 项`), "C.6-A AC-UI 7: organization / platform counts contiguous");
  assert(panel.includes("估算 · 组织价目表第 2 版") && panel.includes("估算 · 组织价目表第 7 版"), "C.6-A AC-UI 8: organization revision visible");
  assert(panel.includes(`来源说明：${NOTE_120}`) && panel.includes("来源说明：2026 Q3 华东采购参考"), "C.6-A AC-UI 8: full persisted sourceNote contiguous (trimmed)");
  assert(count(panel, "估算 · 平台通用区间") === EXPECTED.PLATFORM_ESTIMATE, "C.6-A AC-UI 8: 「估算 · 平台通用区间」 once per platform row");
  assert(count(panel, "核实单价 · 单价") === EXPECTED.VERIFIED && !panel.includes("ignored: VERIFIED wins"), "C.6-A AC-UI 8: VERIFIED rows, no reference text on VERIFIED rows");
  assert(!/revision 0|string revision/.test(panel), "C.6-A AC-UI 7: malformed estimateBasis never surfaces its note");

  // Nothing the C.6-A panel showed is dropped.
  const c6aLines = [...c6aPanel.matchAll(/<p[^>]*>([^<]*(?:单价 |来源说明：)[^<]*)<\/p>/g)].map((m) => m[1].replace(/^核实单价 · /, "已核实单价 · "));
  assert(c6aLines.length === ITEMS.length + EXPECTED.ORGANIZATION_ESTIMATE, `fixture: C.6-A panel row lines (got ${c6aLines.length})`);
  for (const line of c6aLines) assert(panel.includes(line), `information preserved: ${line.slice(0, 40)}`);
  for (const item of ITEMS) assert(panel.includes(`单价 ${item.unitPriceMin} - ${item.unitPriceMax}`), `information preserved: unit price ${item.unitPriceMin}`);
  assert(panel.includes("价格依据（本预算保存时的快照）") && panel.includes("之后修改组织估算价目表不会改变本预算，重新计算才会生成新的预算。"), "information preserved: snapshot heading + historical-immutability note");

  // Readability: pricing text ≥ text-sm, never text-zinc-500.
  const basisLines = [...panel.matchAll(/<p class="([^"]*)">((?:已核实单价|估算 · )[^<]*单价 [^<]*)<\/p>/g)];
  assert(basisLines.length === ITEMS.length, `UX 2: one basis line per row (got ${basisLines.length})`);
  assert(basisLines.every((m) => /\btext-sm\b/.test(m[1]) && !/\btext-xs\b|\btext-zinc-500\b/.test(m[1])), "UX 2: basis + unit price line is text-sm, not zinc-500");
  const noteLines = [...panel.matchAll(/<p class="([^"]*)">来源说明：/g)];
  assert(noteLines.length === EXPECTED.ORGANIZATION_ESTIMATE && noteLines.every((m) => /\btext-sm\b/.test(m[1]) && /\bbreak-words\b/.test(m[1]) && !/\btext-xs\b|\btext-zinc-500\b/.test(m[1])), "UX 2: sourceNote is text-sm, wraps, not zinc-500");
  assert(!panel.includes("text-zinc-500"), "UX 2: no text-zinc-500 anywhere in the pricing panel");
  assert(/<p class="text-sm text-zinc-400">组织价目估算仍属估算/.test(panel), "UX 2: footer note text-sm text-zinc-400");

  // Conservative per-source distinction: emerald / sky / neutral zinc, borders + left accent only.
  const rows = [...panel.matchAll(/<li class="([^"]*)">([\s\S]*?)<\/li>/g)];
  assert(rows.length === ITEMS.length, "fixture: one <li> per Budget row");
  const accent = { VERIFIED: "border-l-emerald-500", ORGANIZATION_ESTIMATE: "border-l-sky-500", PLATFORM_ESTIMATE: "border-l-zinc-500" } as const;
  const badge = { VERIFIED: "border-emerald-700 text-emerald-200", ORGANIZATION_ESTIMATE: "border-sky-700 text-sky-200", PLATFORM_ESTIMATE: "border-zinc-600 text-zinc-200" } as const;
  rows.forEach(([, cls, body], i) => {
    const kind = priceBasis.budgetItemPriceBasis(ITEMS[i]).kind;
    assert(cls.includes(accent[kind]) && /\bborder-l-4\b/.test(cls) && Object.values(accent).filter((a) => cls.includes(a)).length === 1, `UX 3: row ${i} left accent ${accent[kind]}`);
    assert(!/\bbg-/.test(cls), `UX 3: row ${i} has no background fill`);
    assert(body.includes(`class="rounded-full border px-2 text-xs ${badge[kind]}">${priceBasis.BUDGET_PRICE_BASIS_LABEL[kind]}</span>`), `UX 3: row ${i} badge ${priceBasis.BUDGET_PRICE_BASIS_LABEL[kind]}`);
  });
  for (const kind of ["VERIFIED", "ORGANIZATION_ESTIMATE", "PLATFORM_ESTIMATE"] as const) {
    assert(panel.includes(`${badge[kind]}">${priceBasis.BUDGET_PRICE_BASIS_LABEL[kind]}：${EXPECTED[kind]} 项</span>`), `UX 3: count chip ${kind}`);
  }
  assert(!/\bbg-(?!black\b)[a-z]+-\d/.test(panel) && !panel.includes("bg-white"), "UX 3: no colored card backgrounds");

  // Pure snapshot render.
  assert(panelHtml(priceBasis, structuredClone(ITEMS)) === panel, "historical: panel is a pure function of the persisted rows");
  const basisSrc = fs.readFileSync(path.join(ROOT, UI_PRICE_BASIS), "utf8");
  assert((basisSrc.match(/^import /gm) ?? []).length === 1 && /^import type \{ BudgetItem \} from "@\/lib\/domain\/tender";$/m.test(basisSrc) && !/fetch\(|use(State|Effect)\b/.test(basisSrc), "C.6-A AC-UI 10: price-basis stays pure (one type import, no fetch / hooks)");
  out(`✓ panel: C.6-A contiguous strings intact (counts, 第 N 版, 来源说明, 平台通用区间 × ${EXPECTED.PLATFORM_ESTIMATE}, 核实单价 · 单价 × ${EXPECTED.VERIFIED}); every C.6-A line preserved; basis / sourceNote text-sm, no zinc-500; emerald / sky / zinc badges + left accents, no fills; pure snapshot render`);
}

function diffLines(base: string, file: string) {
  const diff = git(`diff -U0 ${base} -- "${file}"`).split(/\r?\n/);
  return {
    removed: diff.filter((l) => l.startsWith("-") && !l.startsWith("---")).map((l) => l.slice(1).trim()),
    added: diff.filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1)),
  };
}

function checkPage() {
  const page = fs.readFileSync(path.join(ROOT, UI_BUDGET_PAGE), "utf8");
  const c6aPage = git(`show ${C6A}:${UI_BUDGET_PAGE}`);

  const vsC6a = diffLines(C6A, UI_BUDGET_PAGE);
  assert(json(vsC6a.removed) === json(['<p className="text-xs text-zinc-500">', '<p className="text-xs text-zinc-500">']), `scope: only two C.6-A paragraph classNames replaced (got ${json(vsC6a.removed)})`);
  assert(vsC6a.added.filter((l) => l.trim() === '<p className="text-sm text-zinc-400">').length === 2, "UX 6 / 7: C.6-A link paragraph + no-detail fallback → text-sm text-zinc-400");
  assert(!vsC6a.added.some((l) => /bg-white|bg-emerald-400|下一步|handleCalculate|handleDownloadPdf|\/tender|setAdjust|readStored|writeStored|router\.|fetch\(|use(State|Effect|Router)\b|onClick/.test(l)), "UX 5: additions touch no primary CTA / flow / fetch / router / cache / handler");

  const vsBaseline = diffLines(C6A_BASELINE, UI_BUDGET_PAGE);
  assert(json(vsBaseline.removed) === json(['{option.priceBasis === "VERIFIED" ? "（已核实单价）" : "（估算单价）"}']), `C.6-A AC-UI 11 / 12: vs ${C6A_BASELINE} the only removed line is still the C.1 basis label (got ${json(vsBaseline.removed)})`);
  assert(!vsBaseline.added.some((l) => /bg-white|bg-emerald-400|下一步|handleCalculate|handleDownloadPdf|\/tender|setAdjust|readStored|writeStored|router\./.test(l)), "C.6-A AC-UI 11: additions vs baseline stay off CTA / flow code");

  // UX 6: the low-key C.6-A link survives verbatim.
  const lowKey = '<Link href="/budget/price-reference" className="underline hover:text-zinc-300">';
  assert(page.includes(lowKey) && count(page, lowKey) === count(c6aPage, lowKey) && page.split(/\r?\n/).some((l) => l.trim() === "管理组织估算价目表"), "UX 6: low-key C.6-A 「管理组织估算价目表」 link preserved");
  assert(page.includes("组织维护了估算价目的子品类按组织价目估算（仍属估算）。"), "UX 6: C.6-A tier help text preserved");

  // UX 5: one secondary entry right after the panel, only when a Budget exists.
  const panelAt = page.indexOf("budgetId && budgetDetail?.quoteId === quoteId ?");
  const nextSectionAt = page.indexOf("② 客户目标预算对照", panelAt);
  assert(panelAt > 0 && nextSectionAt > panelAt, "fixture: panel block located");
  const block = page.slice(panelAt, nextSectionAt);
  assert(block.includes("<BudgetPriceBasisPanel items={budgetDetail.items} />") && block.includes(") : budgetId ? ("), "G14: panel / no-detail fallback branching unchanged");
  assert(block.includes("本浏览器标签页没有该预算的明细快照，暂不能逐项显示价格依据；预算 PDF 按该预算保存时的依据生成。") && c6aPage.includes("本浏览器标签页没有该预算的明细快照，暂不能逐项显示价格依据；预算 PDF 按该预算保存时的依据生成。"), "UX 7: fallback wording unchanged");
  const secondary = block.match(/\{budgetId \? \(\s*<div className="([^"]*)">\s*<span>([^<]*)<\/span>\s*<Link\s+href="\/budget\/price-reference"\s+className="([^"]*)"\s*>\s*管理组织估算价目表 →\s*<\/Link>\s*<\/div>\s*\) : null\}/);
  assert(secondary, "UX 5: secondary 「管理组织估算价目表 →」 Link to /budget/price-reference inside {budgetId ? …}, after the panel");
  assert(secondary.index! > block.indexOf("<BudgetPriceBasisPanel"), "UX 5: secondary entry sits after the panel");
  assert(/\btext-sm\b/.test(secondary[1]) && !/text-zinc-500/.test(secondary[1]) && secondary[2].includes("仍属估算"), "UX 5: helper text readable and says 仍属估算");
  assert(/\bborder\b/.test(secondary[3]) && /\bborder-sky-700\b/.test(secondary[3]) && !/\bbg-/.test(secondary[3]) && !/font-(semibold|bold)/.test(secondary[3]), "UX 5: outline-only secondary style (no bg-white / bg-emerald-400 / fill / bold)");
  assert(count(page, "管理组织估算价目表 →") === 1 && count(page, 'href="/budget/price-reference"') === count(c6aPage, 'href="/budget/price-reference"') + 1, "UX 5: exactly one new entry");

  // Primary CTAs / delivery path / fetches unchanged.
  const fetchTargets = (src: string) => [...src.matchAll(/fetch\(\s*([`"][^`"]*)/g)].map((m) => m[1]).sort();
  assert(json(fetchTargets(page)) === json(fetchTargets(c6aPage)), `scope: fetch targets identical to C.6-A (got ${json(fetchTargets(page))})`);
  for (const s of ["交付路径：项目 → 方案 → 预算 → 投标 → 下载", "下一步：生成投标文件", "下载预算 PDF"]) {
    assert(count(page, s) === count(c6aPage, s) && count(page, s) > 0, `delivery path / primary CTA unchanged: ${s}`);
  }
  for (const s of ["bg-white", "bg-emerald-400", "readStoredAdjustmentDetail(", "writeStoredAdjustmentDetail(", "handleCalculate", "handleDownloadPdf", "router."]) {
    assert(count(page, s) === count(c6aPage, s), `primary CTA / flow usage count unchanged: ${s}`);
  }
  out("✓ page: only the two C.6-A paragraphs → text-sm text-zinc-400 and one secondary outline 「管理组织估算价目表 →」 after the panel (budgetId only); low-key C.6-A link, fallback branching / wording, CTAs, delivery path, fetch targets unchanged; vs 5bc60fb8 still only the C.1 label line removed");
}

function checkScope() {
  const changed = git(`diff --name-only ${C6A}`).split(/\r?\n/).filter(Boolean).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(json(changed.sort()) === json([UI_BUDGET_PAGE, UI_PRICE_BASIS].sort()), `scope: tracked changes vs C.6-A are exactly the two UI files (got ${json(changed)})`);
  const untracked = git("ls-files --others --exclude-standard").split(/\r?\n/).filter(Boolean).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(json(untracked) === json([VERIFIER]), `scope: only new file is this verifier (got ${json(untracked)})`);
  const frozen = [
    "lib", "app/api", "prisma", "app/(product)/budget/price-reference", "app/(product)/tender", "app/(product)/quote",
    "scripts/verify-c6-a-organization-estimate-price-reference.ts", "package.json", "package-lock.json",
  ];
  const touched = git(`diff --name-only ${C6A} -- ${frozen.map((f) => `"${f}"`).join(" ")}`).split(/\r?\n/).filter(Boolean).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(touched.length === 0, `scope: pricing / API / services / schema / PDF / tender / quote / price-reference page / frozen C.6-A verifier untouched (got ${json(touched)})`);
  out("✓ scope: tracked changes = page.tsx + price-basis.tsx; new file = this verifier; lib / API / Prisma / price-reference page / tender / quote / frozen C.6-A verifier untouched");
}

try {
  checkSemanticsUnchanged();
  checkPanel();
  checkPage();
  checkScope();
  out(`\nC.6-B Budget Pricing UX Clarity: PASS (${passed} assertions)`);
} catch (err) {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
}
