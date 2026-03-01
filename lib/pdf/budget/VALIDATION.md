# 预算 PDF 闭环校验说明

## 🎯 目标

确保政府级预算 PDF 的数据完整性和一致性，防止出现"两套口径不一致"的问题。

---

## ✅ 校验规则

### 1. Items 非空校验
```typescript
if (summary.items.length === 0) {
  throw new Error("GOV_BUDGET_NO_STRICT_ITEMS: qty/unitPrice parse failed");
}
```

**说明**: 
- 政府级预算必须有明确的设备清单
- 如果解析失败（qtyText 或 unitPriceText 格式不正确），直接报错
- 不允许空清单

### 2. Items 合计校验（核心）
```typescript
const sum = summary.items.reduce(
  (acc, it) => ({
    min: acc.min + it.subtotalMin,
    max: acc.max + it.subtotalMax,
  }),
  { min: 0, max: 0 }
);

if (sum.min !== summary.total.min || sum.max !== summary.total.max) {
  throw new Error(
    `GOV_BUDGET_TOTAL_MISMATCH: ` +
    `itemsSum=${sum.min}-${sum.max} ` +
    `total=${summary.total.min}-${summary.total.max}`
  );
}
```

**说明**:
- Items 的 subtotal 合计必须**精确等于** total
- 不允许有任何误差
- 这是政府评审的核心要求：**单一口径**

### 3. Item Subtotal 计算校验
```typescript
for (const it of summary.items) {
  const expectedMin = it.qtyMin * it.priceMin;
  const expectedMax = it.qtyMax * it.priceMax;

  if (Math.abs(it.subtotalMin - expectedMin) > 0.01) {
    throw new Error(`Item subtotal mismatch: ${it.name}`);
  }
  
  if (Math.abs(it.subtotalMax - expectedMax) > 0.01) {
    throw new Error(`Item subtotal mismatch: ${it.name}`);
  }
}
```

**说明**:
- 每个 item 的 subtotal 必须等于 `qty × price`
- 允许 0.01 的浮点误差
- 确保计算公式正确

---

## 🔍 校验时机

### Government 级别
```typescript
async function renderGovernmentStrict(input, opts) {
  // 1. 获取基础数据
  const summary = await getBudgetSummary(input);
  
  // 2. 生成文档编号
  const docNo = generateDocNumber(input.planId);
  
  // 3. 转换为严格结构
  const strictSummary = toStrictSummary(summary, docNo);
  
  // 4. ✅ 强制闭环校验（关键）
  assertStrict(strictSummary);
  
  // 5. 渲染 PDF
  return renderGovernmentPdf(strictSummary);
}
```

**特点**:
- 在渲染**之前**进行校验
- 校验失败直接抛出错误，不生成 PDF
- 确保输出的 PDF 数据绝对正确

### Brand 级别
```typescript
async function renderCompact2Pages(input, opts) {
  // ❌ 不进行强制校验
  // Brand 级别允许灵活的数据格式
  const summary = await getBudgetSummary(input);
  return renderBrandPdf(summary);
}
```

**特点**:
- 不进行强制校验
- 允许数据格式灵活
- 适用于快速商业报价

---

## 📊 数据流

### 完整流程

```
getBudgetSummary()
    ↓
  lines[] (原始数据)
    ↓
toStrictSummary()
    ↓
  StrictSummary {
    items: StrictItem[],
    total: { min, max }
  }
    ↓
assertStrict() ✅ 校验
    ↓
  - items.length > 0
  - sum(items.subtotal) === total
  - each item: subtotal === qty × price
    ↓
renderGovernmentPdf()
```

### 数据结构

```typescript
// 原始数据（lines）
{
  category: "有氧设备",
  qtyText: "跑步机5-10台；椭圆机4-6台",
  unitPriceText: "¥8,000-15,000 / 台",
  subtotal: { min: 40000, max: 150000 }
}

// ↓ toStrictSummary() 转换

// 严格数据（items）
[
  {
    category: "有氧设备",
    name: "跑步机",
    qtyMin: 5,
    qtyMax: 10,
    priceMin: 8000,
    priceMax: 15000,
    subtotalMin: 40000,  // = 5 × 8000
    subtotalMax: 150000, // = 10 × 15000
  },
  {
    category: "有氧设备",
    name: "椭圆机",
    qtyMin: 4,
    qtyMax: 6,
    priceMin: 8000,
    priceMax: 15000,
    subtotalMin: 32000,  // = 4 × 8000
    subtotalMax: 90000,  // = 6 × 15000
  }
]

// total
{
  min: 72000,  // = 40000 + 32000
  max: 240000, // = 150000 + 90000
}
```

---

## ❌ 常见错误

### 错误 1: GOV_BUDGET_NO_STRICT_ITEMS

**原因**: qtyText 或 unitPriceText 格式不正确，无法解析

**示例**:
```typescript
// ❌ 错误格式
qtyText: "若干台"
unitPriceText: "面议"

// ✅ 正确格式
qtyText: "5-10台"
unitPriceText: "¥8,000-15,000 / 台"
```

**解决方案**:
1. 检查数据源格式
2. 确保使用 "min-max" 格式
3. 使用 `pickRangeFromText()` 测试解析

### 错误 2: GOV_BUDGET_TOTAL_MISMATCH

**原因**: Items 合计不等于 total

**示例**:
```typescript
// ❌ 错误
items: [
  { subtotalMin: 40000, subtotalMax: 150000 },
  { subtotalMin: 32000, subtotalMax: 90000 },
]
total: { min: 70000, max: 240000 } // min 不匹配！

// ✅ 正确
items: [
  { subtotalMin: 40000, subtotalMax: 150000 },
  { subtotalMin: 32000, subtotalMax: 90000 },
]
total: { min: 72000, max: 240000 } // 精确匹配
```

**解决方案**:
1. 使用 `toStrictSummary()` 自动计算 total
2. 不要手动设置 total
3. 确保 `toStrictSummary()` 中的 reduce 逻辑正确

### 错误 3: GOV_BUDGET_ITEM_SUBTOTAL_MISMATCH

**原因**: Item 的 subtotal 不等于 qty × price

**示例**:
```typescript
// ❌ 错误
{
  qtyMin: 5,
  priceMin: 8000,
  subtotalMin: 39999, // 应该是 40000
}

// ✅ 正确
{
  qtyMin: 5,
  priceMin: 8000,
  subtotalMin: 40000, // = 5 × 8000
}
```

**解决方案**:
1. 使用 `toStrictSummary()` 自动计算 subtotal
2. 不要手动设置 subtotal
3. 检查浮点数精度问题

---

## 🔧 调试方法

### 1. 启用详细日志

```typescript
console.log("[STRICT_VALIDATE] Items:", summary.items);
console.log("[STRICT_VALIDATE] Total:", summary.total);
console.log("[STRICT_VALIDATE] Sum:", sum);
```

### 2. 单独测试 toStrictSummary

```typescript
import { toStrictSummary, assertStrict } from "@/lib/pdf/budget/strict";

const result = toStrictSummary(
  {
    planId: "test-001",
    companyName: "测试企业",
    companySize: 200,
    tier: "mid",
    lines: [
      {
        category: "有氧设备",
        qtyText: "跑步机5-10台",
        unitPriceText: "¥8,000-15,000 / 台",
      },
    ],
  },
  "AFS-GOV-20260301-TEST-01"
);

console.log("Items:", result.items);
console.log("Total:", result.total);

// 测试校验
assertStrict(result);
```

### 3. 检查原始数据

```typescript
const summary = await getBudgetSummary(input);
console.log("Lines:", summary.lines);
console.log("OverallTotal:", summary.overallTotal);
console.log("EstimatedBySubtotals:", summary.estimatedBySubtotals);
```

---

## 📝 最佳实践

### 1. 单一口径原则

**政府版**: 只使用 `strictSummary.total`
- ❌ 不使用 `overallTotal`
- ❌ 不使用 `estimatedBySubtotals`
- ✅ 只使用 `strictSummary.total`（由 items 计算得出）

**原因**: 评审最讨厌"两套口径不一致"

### 2. 数据来源

**优先级**:
1. `toStrictSummary()` 自动计算（推荐）
2. 手动构建（需要确保计算正确）
3. ❌ 不要混用多个数据源

### 3. 错误处理

```typescript
try {
  const strictSummary = toStrictSummary(data, docNo);
  assertStrict(strictSummary);
  return renderGovernmentPdf(strictSummary);
} catch (error) {
  console.error("Validation failed:", error);
  // ❌ 不要回退到 Brand 级别
  // ✅ 直接抛出错误，让调用方处理
  throw error;
}
```

---

## 🔗 相关文件

- 校验实现：`strict.ts` (`assertStrict` 函数)
- 主渲染器：`../budgetRender.ts` (`renderGovernmentStrict` 函数)
- 架构设计：`ARCHITECTURE.md`
- 类型定义：`types.ts`

---

## ✅ 检查清单

在提交政府级预算 PDF 之前，确保：

- [ ] Items 数量 > 0
- [ ] 每个 item 的 subtotal = qty × price
- [ ] Items 合计 = total
- [ ] 只使用一套口径（strictSummary.total）
- [ ] 文档编号格式正确（AFS-GOV-YYYYMMDD-PLANID-01）
- [ ] 校验通过（assertStrict 无异常）

---

## 📞 支持

如有问题，请查看：
- 校验说明：本文档
- 架构设计：`ARCHITECTURE.md`
- 使用指南：`USAGE.md`
