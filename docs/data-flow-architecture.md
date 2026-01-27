# 数据流向架构文档

## 架构原则

**plan.json 是唯一事实源（Single Source of Truth）**

所有功能（PDF 渲染、后台留资、销售/升级）都从 plan.json 读取数据，而不是各自独立生成。

## 数据流向

```
表单提交
  ↓
/api/plan (LLM 生成)
  ↓
plan.json（唯一事实源）
  ↓
  ├─→ PDF 渲染 (/api/pdf)
  ├─→ 结果页面 (/result)
  ├─→ 后台留资（数据库存储）
  └─→ 销售/升级（CRM 集成）
```

## 标准 plan.json 格式

定义在 `lib/types/plan.ts`：

```typescript
{
  meta: {
    plan_id: "ATG-20260120-2744",
    generated_at: "2026-01-20",
    version: "v1"
  },
  client_profile: {
    company_size: 150,
    industry: "企业办公",
    space_area: 200,
    scene: "办公楼",
    budget_range: "5-10万"
  },
  solution_summary: {
    management_conclusion: [
      "适用于150人规模企业",
      "200㎡可落地基础有氧+力量",
      "预算控制在5-10万"
    ]
  },
  equipment_plan: [
    {
      category: "有氧",
      items: [
        { name: "跑步机", qty: 1, price_level: "中" }
      ]
    }
  ],
  implementation: {
    phase_1: "方案确认（7天）",
    phase_2: "采购与安装（30天）",
    phase_3: "运营优化（90天）"
  },
  upsell_modules: {
    layout_design: true,
    "3d_render": false,
    rehab_module: false
  },
  next_actions: [
    "提交平面图深化",
    "获取精确报价",
    "联系顾问"
  ]
}
```

## 关键文件

### 1. `/app/api/plan/route.ts`
- **职责**：接收表单数据，调用 LLM，生成标准的 plan.json
- **输入**：表单数据（companySize, area, scenario, budget 等）
- **输出**：标准的 plan.json 格式

### 2. `/lib/types/plan.ts`
- **职责**：定义 plan.json 的 TypeScript 类型
- **包含**：Plan 接口、验证函数、工具函数

### 3. `/app/api/pdf/route.ts`
- **职责**：从 plan.json 生成 PDF
- **数据流**：plan.json → normalizePlanData → generatePDF → PDF Buffer
- **适配层**：`normalizePlanData` 函数将标准格式转换为 PDF 生成函数期望的格式

### 4. `/app/plan/page.tsx`
- **职责**：表单页面，提交后接收 plan.json 并保存到 localStorage
- **数据流**：表单 → /api/plan → plan.json → localStorage

### 5. `/app/result/page.tsx`
- **职责**：结果展示页面，从 localStorage 读取 plan.json
- **数据流**：localStorage → plan.json → 页面渲染

## 优势

1. **单一数据源**：所有功能都从同一个 plan.json 读取，保证数据一致性
2. **易于维护**：修改数据结构只需更新 plan.json 格式和适配层
3. **可扩展**：新增功能（如 CRM 集成）只需读取 plan.json，无需重新生成数据
4. **类型安全**：TypeScript 类型定义确保数据结构正确

## 后续扩展

### 数据库存储（可选）
在 `/app/api/plan/route.ts` 中添加：
```typescript
// TODO: 保存 plan.json 到数据库（Prisma）
await savePlanToDatabase(planJson);
```

### CRM 集成（可选）
创建 `/app/api/crm/sync/route.ts`：
```typescript
// 从 plan.json 同步到 CRM
const plan = await getPlanFromDatabase(planId);
await syncToCRM(plan);
```

### 后台留资（可选）
创建 `/app/api/leads/save/route.ts`：
```typescript
// 保存线索信息（从 plan.json 提取）
const lead = extractLeadFromPlan(plan);
await saveLead(lead);
```

## 注意事项

1. **向后兼容**：PDF 生成函数使用 `normalizePlanData` 适配层，支持新旧两种格式
2. **数据验证**：使用 `validatePlan` 函数确保 plan.json 格式正确
3. **错误处理**：如果 plan.json 格式不正确，应该返回明确的错误信息

