// lib/pdf/plan/renderPlan22.ts
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import crypto from "crypto";
import { PDFDocument, rgb } from "pdf-lib";
import { getBudgetSummary } from "@/lib/services/budgetService";
import { BUDGET_PDF_VERSION } from "@/lib/pdf/budgetRender";
import { computeBrandLayout, drawBrandHeader, drawBrandFooter, drawSectionTitle, TYPE, drawH1, drawKicker, drawDivider } from "@/lib/pdf/brand";
import { THEMES, drawFooter, drawHR, drawHeaderSlim, type PdfTheme, type HeaderMeta } from "@/lib/pdf/theme";

/**
 * ✅ A方案：22页"金样板"回放引擎（桥接页）
 * - 读取金样板 PDF
 * - 仅在第一页覆盖“预算信息区块”
 * - 不改变页数与结构
 */

function resolveGoldenPath(planId: string) {
  if (planId === "attaguy-plan") {
    return path.join(process.cwd(), "public", "golden", "plan_attaguy-plan.pdf");
  }
  return path.join(process.cwd(), "public", "golden", `plan_${planId}.pdf`);
}

type PlanInput = {
  companyName?: string;
  size?: number;
  budgetRange?: string; // e.g. "10-20万"
  budgetTier?: string;  // optional
};
type Plan = { input?: PlanInput };

// TODO: 你实际项目里应从 DB/plan.json 读取
async function loadPlan(planId: string): Promise<Plan> {
  return {
    input: {
      companyName: "示例企业",
      size: 200,
      budgetRange: "10-20万",
      // budgetTier: "mid",
    },
  };
}

const CNY = "CNY"; // 统一单位口径

function fmtMoney(n: number) {
  const x = Math.round(Number(n || 0));
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 稳定短签名：Node crypto，避免 crypto.subtle 不可用 */
function shortSigHex(payload: string) {
  return crypto.createHash("sha256").update(payload, "utf8").digest("hex").slice(0, 12);
}

function drawSectionBridge(
  page: any,
  font: any,
  layout: { left: number; right: number; w: number },
  y: number,
  title: string
) {
  const contentW = layout.w - layout.left - layout.right;

  // 上分割线
  page.drawLine({
    start: { x: layout.left, y },
    end: { x: layout.left + contentW, y },
    thickness: 1,
    color: TYPE.C.line,
  });

  // 标题
  page.drawText(title, {
    x: layout.left,
    y: y - 16,
    size: TYPE.H2,
    font,
    color: TYPE.C.text,
  });

  // 下分割线
  page.drawLine({
    start: { x: layout.left, y: y - 24 },
    end: { x: layout.left + contentW, y: y - 24 },
    thickness: 1,
    color: TYPE.C.line,
  });

  return y - 36; // 返回新的 Y
}

// 解析 "5-10万" / "10~20万" / "约10万" → 取最大值（单位：万）
function parseMaxWan(rangeText: string): number | null {
  const s = String(rangeText || "").replace(/\s/g, "");
  if (!s) return null;
  const nums =
    s.match(/\d+(\.\d+)?/g)?.map(Number).filter((n) => Number.isFinite(n)) || [];
  if (!nums.length) return null;
  return Math.max(...nums);
}

function deriveTier(budgetRange: string): "low" | "mid" | "high" {
  const maxWan = parseMaxWan(budgetRange);
  if (maxWan == null) return "mid";
  if (maxWan <= 10) return "low";
  if (maxWan <= 25) return "mid";
  return "high";
}

export async function renderPlan22PdfBytes(planId: string): Promise<Uint8Array> {
  const p = resolveGoldenPath(planId);
  const buf = await fs.readFile(p);

  const doc = await PDFDocument.load(buf);
  doc.registerFontkit(fontkit);

  const plan = await loadPlan(planId);
  const inputBudgetRange = plan?.input?.budgetRange || "";
  const companyName = plan?.input?.companyName || "示例企业";
  const companySize = Number(plan?.input?.size || 200);

  // ✅ 优先使用 plan.input.budgetTier；否则从 budgetRange 推导
  const budgetTier =
    (plan?.input?.budgetTier as any) === "low" ||
    (plan?.input?.budgetTier as any) === "mid" ||
    (plan?.input?.budgetTier as any) === "high"
      ? (plan!.input!.budgetTier as "low" | "mid" | "high")
      : deriveTier(inputBudgetRange);

  // ✅ reqSig：与 budget route 的 payload 对齐（pdfVersion 用同一个常量）
  const sigPayload = JSON.stringify({
    planId,
    mode: "budget",
    companyName,
    companySize,
    budgetTier,
    pdfVersionBudget: BUDGET_PDF_VERSION,
  });
  const reqSig = shortSigHex(sigPayload);
  const short = reqSig.slice(0, 8).toUpperCase();

  // ✅ 与预算书同源的 summary（桥接核心）
  const bs = await getBudgetSummary({
    planId,
    companyName,
    companySize,
    budgetTier,
  });

  // ✅ 中文字体
  const fontBytes = await fs.readFile(
    path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf")
  );
  const font = await doc.embedFont(fontBytes, { subset: true });

  const page1 = doc.getPage(0);

  // === 统一 Brand Bridge 条（只在首页） ===
  const bridgeLayout = {
    left: 48,
    right: 48,
    w: page1.getSize().width,
  };

  let bridgeY = 620;
  const contentW = bridgeLayout.w - bridgeLayout.left - bridgeLayout.right;

  // ✅ 清掉桥接条所在的整条区域（建议高度 60~80）
  page1.drawRectangle({
    x: bridgeLayout.left - 4,
    y: bridgeY - 70,
    width: contentW + 8,
    height: 85,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });

  bridgeY = drawSectionBridge(
    page1,
    font,
    bridgeLayout,
    bridgeY,
    "预算测算说明（与预算报告一致）"
  );

  /**
   * ✅ 预算信息区块定位（你只需要调这里）
   * 目前这组坐标已匹配你截图的“预算范围”位置
   */
  const box = {
    x: 40,
    y: 520,   // ✅ 关键：下移
    w: 520,
    h: 68,    // ✅ 只够三行预算 + 右侧两行
  };

  // ✅ 1) 先遮盖旧预算区（注意：只遮这块，不要遮到上面的信息）
  page1.drawRectangle({
    x: box.x - 2,
    y: box.y - 2,
    width: box.w + 4,
    height: box.h + 4,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });

  // ✅ 2) 区块内排版
  const lineSize = 11;
  const lineGap = 16;

  // ✅ 从 box 顶部开始往下写
  let y = box.y + box.h - 16;
  const x = box.x;

  // ✅ 右侧列：详见预算报告 + 报告校验码
  const rightX = box.x + 330;
  const rightY = box.y + box.h - 16;

  page1.drawText("详见《设备采购预算测算报告》", {
    x: rightX,
    y: rightY,
    size: 10,
    font,
    color: rgb(0.10, 0.12, 0.14),
  });

  page1.drawText(`报告校验码：${short}`, {
    x: rightX,
    y: rightY - 16,
    size: 10,
    font,
    color: rgb(0.35, 0.40, 0.45),
  });

  // 左侧三行（预算区）
  page1.drawText(`预算期望（输入）：${inputBudgetRange || "未填写"}`, {
    x, y, size: lineSize, font, color: rgb(0.15, 0.15, 0.15),
  });
  y -= lineGap;

  page1.drawText(
    `预算结论（系统建议）：${CNY}${fmtMoney(bs.overallTotal.min)}-${CNY}${fmtMoney(bs.overallTotal.max)}（与预算书一致）`,
    { x, y, size: lineSize, font, color: rgb(0.15, 0.15, 0.15) }
  );
  y -= lineGap;

  if (bs.estimatedBySubtotals) {
    page1.drawText(
      `按分项估算：${CNY}${fmtMoney(bs.estimatedBySubtotals.min)}-${CNY}${fmtMoney(bs.estimatedBySubtotals.max)}`,
      { x, y, size: lineSize, font, color: rgb(0.15, 0.15, 0.15) }
    );
  }

  // ✅ Metadata（用于验签/回归）
  try {
    doc.setTitle(`Plan22 - ${planId}`);
    doc.setSubject(`AI_FITNESS_SOLUTION Plan22 PDF`);
    doc.setCreator(`AI_FITNESS_SOLUTION; PLAN22_STABLE`);
    doc.setProducer(`AI_FITNESS_SOLUTION; PLAN22_V1`);
    doc.setKeywords([
      `PLAN:${planId}`,
      `REQSIG:${reqSig}`,
      `MODE:plan22`,
      `SIZE:${companySize}`,
      `TIER:${budgetTier}`,
      `BUDGET_VER:${BUDGET_PDF_VERSION}`,
    ]);
  } catch {}

  // ✅ 统一页眉页脚（22 页全部加）
  const pages = doc.getPages();
  const pageTotal = pages.length;

  // 用与你 budget 同样的 ymd（Tokyo 格式）
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()).replaceAll("-", "/");

  const TOC_PAGE_INDEX = 1; // 如果你的目录在第3页，就改成 2
  const DRAW_PLAN_HEADER = true; // ✅ 打开 Slim Header 叠加

  // ✅ 统一主题系统
  const theme = THEMES["brand"]; // 可以根据需要切换为 "tender"
  const planEngineFP = "PLAN22_ENGINE_V1";

  for (let i = 0; i < pageTotal; i++) {
    const p = pages[i];
    const layout = computeBrandLayout(p);

    if (DRAW_PLAN_HEADER) {
      // ✅ 清顶一条很薄的安全带（避免 golden 顶部如果有轻微文字被覆盖）
      // 高度不要大，控制在 26~32 之间最安全
      const H = p.getHeight();
      p.drawRectangle({
        x: 0,
        y: H - 34,
        width: layout.width,
        height: 34,
        color: rgb(1, 1, 1),
        borderWidth: 0,
      });

      // ✅ 画 slim header（不画右侧大框，不压 golden 结构）
      drawHeaderSlim(p, theme, font, {
        companyName,
        companySize,
        tierLabel: String(budgetTier).toUpperCase(),
        planId,
        dateYmd: ymd,
      });
    }

    // ✅ 关键：清底一条 footer 安全带，擦掉金样板自带页脚的视觉内容
    p.drawRectangle({
      x: 0,
      y: 0,
      width: layout.width,
      height: layout.bottom + 8, // 覆盖到你 footer 文本以上一点
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    // ✅ 统一页脚（使用 theme.ts）
    drawFooter(p, theme, font, {
      planId,
      dateYmd: ymd,
      pageNo: i + 1,
      pageTotal,
      sig: reqSig?.slice(0, 12),
      fp: planEngineFP,
    });

    if (i === TOC_PAGE_INDEX) {
      const contentW = layout.width - layout.left - layout.right;

      // =============================
      // 1️⃣ 彻底清掉 golden 目录区
      // =============================

      // 清掉从 layout.top 往下 260pt 的区域
      // （这个高度足够覆盖 golden 的"执行摘要 + bullet"）
      p.drawRectangle({
        x: layout.left - 10,
        y: layout.top - 260,
        width: contentW + 20,
        height: 260,
        color: rgb(1, 1, 1),
        borderWidth: 0,
      });

      // =============================
      // 2️⃣ 重画我们自己的目录
      // =============================

      // 标题区更紧凑
      const yTitle = layout.top - 18;

      // 主标题
      p.drawText("目录", {
        x: layout.left,
        y: yTitle,
        size: 18,
        font,
        color: rgb(0.08, 0.10, 0.12),
      });

      // 英文副标题更贴合
      const ySub = yTitle - 16;
      p.drawText("Table of Contents", {
        x: layout.left,
        y: ySub,
        size: 10,
        font,
        color: rgb(0.50, 0.55, 0.60),
      });

      // 分割线离标题近一点
      const yLine = yTitle - 34;
      p.drawLine({
        start: { x: layout.left, y: yLine },
        end: { x: layout.left + contentW, y: yLine },
        thickness: 1,
        color: rgb(0.93, 0.94, 0.96),
      });

      // 卡片上移（关键）
      const cardTop = yLine - 8;

      // =============================
      // 3️⃣ 卡片
      // =============================

      const padX = 20;
      const padY = 14;
      const rowH = 22;
      const footH = 20;

      const items = [
        "本方案面向约 200 人规模企业的办公健身空间建设需求，具备良好的可实施性与通用性。",
        "在约 120m² 场地条件下，可形成有氧、力量及基础拉伸功能的综合配置体系。",
        "整体预算建议控制在 10–20 万区间，兼顾安全性、耐用性与长期使用价值。",
      ];

      const cardX = layout.left + 32;
      const cardW = contentW - 64;
      const cardH = padY * 2 + items.length * rowH + footH;
      const cardY = cardTop - cardH;

      p.drawRectangle({
        x: cardX,
        y: cardY,
        width: cardW,
        height: cardH,
        color: rgb(0.995, 0.995, 0.998),
        borderColor: rgb(0.90, 0.92, 0.94),
        borderWidth: 1,
      });

      // 左侧强调条
      p.drawRectangle({
        x: cardX,
        y: cardY,
        width: 2,
        height: cardH,
        color: rgb(0.88, 0.90, 0.92),
        borderWidth: 0,
      });

      // =============================
      // 4️⃣ 勾选项
      // =============================

      const startY = cardTop - padY - 6;
      let yy = startY;
      const boxSize = 10;
      const boxX = cardX + padX;
      const textX = boxX + boxSize + 10;

      for (const item of items) {
        const boxY = yy - 3; // 🔥 比 yy-2 稍微下移一点点
        p.drawRectangle({
          x: boxX,
          y: boxY,
          width: boxSize,
          height: boxSize,
          borderColor: rgb(0.55, 0.60, 0.65),
          borderWidth: 1,
          color: undefined as any,
        });

        // check
        p.drawLine({
          start: { x: boxX + 2, y: boxY + 8 },
          end: { x: boxX + 4, y: boxY + 5 },
          thickness: 0.9,
          color: rgb(0.25, 0.30, 0.35),
        });
        p.drawLine({
          start: { x: boxX + 4, y: boxY + 5 },
          end: { x: boxX + 8, y: boxY + 11 },
          thickness: 0.9,
          color: rgb(0.25, 0.30, 0.35),
        });

        p.drawText(item, {
          x: textX,
          y: yy,
          size: 11,
          font,
          color: rgb(0.10, 0.12, 0.14),
        });

        yy -= rowH;
      }

      // 注释
      p.drawText("注：以上为目录要点摘要，详细说明见后续章节。", {
        x: cardX + padX,
        y: cardY + 12,
        size: 9.5,
        font,
        color: rgb(0.45, 0.50, 0.55),
      });
    }
  }

  const modifiedBytes = await doc.save();
  return new Uint8Array(modifiedBytes);
}