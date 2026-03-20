# 预算 PDF 使用指南

## 🎯 概述

预算 PDF 系统支持两种级别：
- **Brand 级别**: 2 页紧凑商业版（默认）
- **Government 级别**: 4-6 页严格政府招标版

---

## 📝 基本使用

### 导入
```typescript
import { renderBudgetPdfBuffer } from "@/lib/pdf/budgetRender";
import type { BudgetPdfInput, RenderBudgetPdfOpts, BudgetLevel } from "@/lib/pdf/budgetRender";
```

### Brand 级别（默认）

```typescript
const pdfBytes = await renderBudgetPdfBuffer(
  {
    planId: "test-001",
    companyName: "测试企业",
    companySize: 200,
    budgetTier: "mid",
  },
  {
    level: "brand", // 可省略，默认为 "brand"
    dateTokyoYmd: "2026/03/01",
    reqsig: "abc123...",
    pdfVersion: "V1.0",
    engineFP: "ENGINE_FP_001",
  }
);
```

**输出**: 2 页 PDF
- 第 1 页：总览 + 分项小计
- 第 2 页：明细清单

### Government 级别

```typescript
const pdfBytes = await renderBudgetPdfBuffer(
  {
    planId: "attaguy-plan",
    companyName: "XX 市政府机关",
    companySize: 500,
    budgetTier: "high",
  },
  {
    level: "government", // ✅ 指定为政府级别
    dateTokyoYmd: "2026/03/01",
    reqsig: "abc123...",
    pdfVersion: "V1.0",
    engineFP: "ENGINE_FP_001",
  }
);
```

**输出**: 4-6 页 PDF（当前为占位符，回退到 Brand 级别）
- 第 1 页：封面
- 第 2 页：总览
- 第 3-4 页：详细清单
- 第 5 页：技术规格
- 第 6 页：附件与签章

---

## 🔧 参数说明

### BudgetPdfInput

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `planId` | `string` | ✅ | 方案 ID |
| `companyName` | `string` | ✅ | 企业名称 |
| `companySize` | `number` | ✅ | 企业规模（人数） |
| `budgetTier` | `"low" \| "mid" \| "high"` | ✅ | 预算档位 |

### RenderBudgetPdfOpts

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `level` | `"brand" \| "government"` | ❌ | `"brand"` | 预算级别 |
| `theme` | `"brand" \| "tender"` | ❌ | `"brand"` | 主题 |
| `dateTokyoYmd` | `string` | ❌ | 当前日期 | 日期（格式：YYYY/MM/DD） |
| `reqsig` | `string` | ❌ | - | 请求签名 |
| `pdfVersion` | `string` | ❌ | - | PDF 版本 |
| `engineFP` | `string` | ❌ | - | 引擎指纹 |
| `sections` | `BudgetPdfSection[]` | ❌ | 全部 | 要包含的章节 |

---

## 🌐 HTTP API 使用

### Brand 级别

```bash
# 默认（不指定 level）
curl "http://localhost:3000/api/budget?planId=test-001&companyName=测试企业&companySize=200&budgetTier=mid" > budget-brand.pdf

# 明确指定 level=brand
curl "http://localhost:3000/api/budget?planId=test-001&companyName=测试企业&companySize=200&budgetTier=mid&level=brand" > budget-brand.pdf
```

### Government 级别

```bash
curl "http://localhost:3000/api/budget?planId=test-001&companyName=XX市政府&companySize=500&budgetTier=high&level=government" > budget-gov.pdf
```

---

## 📊 级别对比

| 特性 | Brand | Government |
|------|-------|------------|
| 页数 | 2 页 | 4-6 页 |
| 封面 | ❌ | ✅ |
| 总览 | ✅ | ✅ |
| 明细清单 | ✅ | ✅（更详细） |
| 技术规格 | ❌ | ✅ |
| 签章区 | ❌ | ✅ |
| 文档编号 | Plan ID | AFS-GOV-YYYYMMDD-PLANID-01 |
| 数据结构 | 灵活 | 严格（BudgetItemStrict） |
| 总计校验 | ❌ | ✅ |
| 可选地面 | ❌ | ✅ |
| 适用场景 | 商业快速报价 | 政府招标投标 |

---

## 🔄 向后兼容

### 现有代码无需修改

如果不指定 `level` 参数，系统默认使用 `"brand"` 级别，保持与现有行为一致：

```typescript
// ✅ 现有代码继续工作
const pdfBytes = await renderBudgetPdfBuffer(
  {
    planId: "test-001",
    companyName: "测试企业",
    companySize: 200,
    budgetTier: "mid",
  },
  {
    // level 未指定，默认为 "brand"
    dateTokyoYmd: "2026/03/01",
  }
);
```

---

## 🚧 当前状态

### Brand 级别
- ✅ **已完成**：完整实现，可直接使用
- 输出：2 页紧凑商业版 PDF

### Government 级别
- ⚠️ **开发中**：当前为占位符，自动回退到 Brand 级别
- 输出：临时使用 Brand 级别（2 页）
- 预期：4-6 页政府招标版（待实现）

---

## 📝 示例代码

### Next.js API Route

```typescript
// app/api/budget/route.ts
import { NextRequest, NextResponse } from "next/server";
import { renderBudgetPdfBuffer } from "@/lib/pdf/budgetRender";
import type { BudgetLevel } from "@/lib/pdf/budgetRender";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const planId = searchParams.get("planId") || "test-001";
  const companyName = searchParams.get("companyName") || "测试企业";
  const companySize = Number(searchParams.get("companySize") || 200);
  const budgetTier = (searchParams.get("budgetTier") || "mid") as "low" | "mid" | "high";
  const level = (searchParams.get("level") || "brand") as BudgetLevel;
  
  const pdfBytes = await renderBudgetPdfBuffer(
    { planId, companyName, companySize, budgetTier },
    { level, dateTokyoYmd: new Date().toISOString().slice(0, 10).replace(/-/g, "/") }
  );
  
  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="budget-${level}-${planId}.pdf"`,
    },
  });
}
```

### React Component

```typescript
"use client";

import { useState } from "react";

export default function BudgetDownload() {
  const [level, setLevel] = useState<"brand" | "government">("brand");
  
  const handleDownload = async () => {
    const url = `/api/budget?planId=test-001&companyName=测试企业&companySize=200&budgetTier=mid&level=${level}`;
    window.open(url, "_blank");
  };
  
  return (
    <div>
      <select value={level} onChange={(e) => setLevel(e.target.value as any)}>
        <option value="brand">商业版（2 页）</option>
        <option value="government">政府版（4-6 页）</option>
      </select>
      <button onClick={handleDownload}>下载预算 PDF</button>
    </div>
  );
}
```

---

## 🔗 相关文档

- 架构设计：`ARCHITECTURE.md`
- 类型定义：`types.ts`
- 实施清单：`IMPLEMENTATION.md`
- 主渲染器：`../budgetRender.ts`

---

## 🐛 已知问题

1. **Government 级别未实现**
   - 当前状态：占位符，自动回退到 Brand 级别
   - 预期完成：根据 IMPLEMENTATION.md 的时间表
   - 临时方案：使用 Brand 级别

---

## 📞 支持

如有问题，请查看：
- 使用指南：本文档
- 架构设计：`ARCHITECTURE.md`
- 实施清单：`IMPLEMENTATION.md`
