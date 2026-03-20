# 预算 PDF 引擎架构设计

## 🎯 目标

建立双层级预算 PDF 生成系统：
- **Brand 级别**: 2 页紧凑商业版（现有）
- **Government 级别**: 4-6 页严格政府招标版（新增）

---

## 📊 核心类型定义

### 1. 预算级别
```typescript
type BudgetLevel = "brand" | "government";
```

### 2. 严格预算项（Government 必需）
```typescript
type BudgetItemStrict = {
  // 基础信息
  category: string;        // 类别（有氧、力量、配件等）
  name: string;           // 设备名称
  
  // 数量区间
  qtyMin: number;         // 最小数量
  qtyMax: number;         // 最大数量
  
  // 单价区间（CNY）
  priceMin: number;       // 最小单价
  priceMax: number;       // 最大单价
  
  // 小计区间（CNY）- 自动计算
  subtotalMin: number;    // = qtyMin * priceMin
  subtotalMax: number;    // = qtyMax * priceMax
  
  // 可选字段
  unit?: string;          // 单位（台、套、平方米等）
  brand?: string;         // 品牌要求
  spec?: string;          // 规格说明
  note?: string;          // 备注
};
```

### 3. 可选地面方案
```typescript
type OptionalSurface = {
  rubberMat?: boolean;    // 橡胶垫
  sportFloor?: boolean;   // 运动地板
};
```

### 4. 政府级预算输入
```typescript
type GovernmentBudgetInput = {
  // 基础信息
  planId: string;
  companyName: string;
  companySize: number;
  budgetTier: "low" | "mid" | "high";
  
  // 可选地面
  optionalSurface?: OptionalSurface;
  
  // 项目信息
  projectName?: string;
  projectCode?: string;
  department?: string;
  
  // 日期
  dateYmd?: string;
};
```

### 5. 编号规则
```typescript
type BudgetDocNumber = {
  prefix: "AFS-GOV";      // 固定前缀
  date: string;           // YYYYMMDD
  planId: string;         // PLANID（大写）
  sequence: string;       // 序号（01, 02...）
};

// 示例：AFS-GOV-20260301-ATTAGUY-01
function generateDocNumber(planId: string, sequence: number = 1): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(sequence).padStart(2, "0");
  return `AFS-GOV-${date}-${planId.toUpperCase()}-${seq}`;
}
```

---

## 🏗️ 引擎结构

### 主入口：`renderBudget.ts`

```typescript
export async function renderBudgetPdfBuffer(
  input: BudgetPdfInput,
  opts: RenderBudgetPdfOpts = {}
): Promise<Uint8Array> {
  const level: BudgetLevel = opts.level || "brand";
  
  if (level === "brand") {
    return renderCompact2Pages(input, opts);
  }
  
  if (level === "government") {
    return renderGovernmentStrict(input, opts);
  }
  
  throw new Error(`Unknown budget level: ${level}`);
}
```

### Brand 级别（现有）
```typescript
async function renderCompact2Pages(
  input: BudgetPdfInput,
  opts: RenderBudgetPdfOpts
): Promise<Uint8Array> {
  // 当前的 2 页紧凑商业版
  // - 第 1 页：总览 + 分项小计
  // - 第 2 页：明细清单
}
```

### Government 级别（新增）
```typescript
async function renderGovernmentStrict(
  input: GovernmentBudgetInput,
  opts: RenderBudgetPdfOpts
): Promise<Uint8Array> {
  // 1. 构建严格数据结构
  const items = await buildStrictItems(input);
  
  // 2. 强制校验总计
  validateTotals(items, input);
  
  // 3. 生成文档编号
  const docNumber = generateDocNumber(input.planId);
  
  // 4. 渲染 4-6 页政府版
  // - 第 1 页：封面（文档编号、项目信息）
  // - 第 2 页：总览（总计、分项汇总）
  // - 第 3-4 页：详细清单（所有设备）
  // - 第 5 页：技术规格要求
  // - 第 6 页：附件说明、签章区
}
```

---

## 🔍 数据处理流程

### 1. 构建严格项
```typescript
async function buildStrictItems(
  input: GovernmentBudgetInput
): Promise<BudgetItemStrict[]> {
  // 1. 获取基础预算数据
  const summary = await getBudgetSummary({
    planId: input.planId,
    companyName: input.companyName,
    companySize: input.companySize,
    budgetTier: input.budgetTier,
  });
  
  // 2. 转换为严格结构
  const items: BudgetItemStrict[] = [];
  
  for (const item of summary.items || []) {
    items.push({
      category: item.categoryName || item.category || "未分类",
      name: item.name || item.itemName || "未命名",
      
      // 数量区间
      qtyMin: extractMin(item, ["qtyMin", "qty", "qtyRange"]),
      qtyMax: extractMax(item, ["qtyMax", "qty", "qtyRange"]),
      
      // 单价区间
      priceMin: extractMin(item, ["priceMin", "unitPriceMin", "unitPrice"]),
      priceMax: extractMax(item, ["priceMax", "unitPriceMax", "unitPrice"]),
      
      // 小计自动计算
      subtotalMin: 0, // 稍后计算
      subtotalMax: 0, // 稍后计算
      
      unit: item.unit || "台",
      brand: item.brand,
      spec: item.spec,
      note: item.note,
    });
  }
  
  // 3. 计算小计
  for (const item of items) {
    item.subtotalMin = item.qtyMin * item.priceMin;
    item.subtotalMax = item.qtyMax * item.priceMax;
  }
  
  // 4. 添加可选地面
  if (input.optionalSurface?.rubberMat) {
    items.push(createRubberMatItem(input.companySize));
  }
  
  if (input.optionalSurface?.sportFloor) {
    items.push(createSportFloorItem(input.companySize));
  }
  
  return items;
}
```

### 2. 强制校验
```typescript
function validateTotals(
  items: BudgetItemStrict[],
  input: GovernmentBudgetInput
): void {
  const sumMin = items.reduce((acc, item) => acc + item.subtotalMin, 0);
  const sumMax = items.reduce((acc, item) => acc + item.subtotalMax, 0);
  
  // 获取预期总计
  const expectedMin = input.expectedTotalMin;
  const expectedMax = input.expectedTotalMax;
  
  if (expectedMin != null && Math.abs(sumMin - expectedMin) > 1) {
    throw new Error(
      `Total min mismatch: calculated ${sumMin}, expected ${expectedMin}`
    );
  }
  
  if (expectedMax != null && Math.abs(sumMax - expectedMax) > 1) {
    throw new Error(
      `Total max mismatch: calculated ${sumMax}, expected ${expectedMax}`
    );
  }
  
  console.log("[VALIDATE] Total range:", sumMin, "-", sumMax);
}
```

### 3. 可选地面项
```typescript
function createRubberMatItem(companySize: number): BudgetItemStrict {
  // 按 200 人 = 120m² 估算
  const areaSqm = Math.ceil((companySize / 200) * 120);
  
  return {
    category: "地面配套",
    name: "橡胶地垫（可选）",
    qtyMin: areaSqm,
    qtyMax: areaSqm,
    priceMin: 80,   // CNY/m²
    priceMax: 150,  // CNY/m²
    subtotalMin: areaSqm * 80,
    subtotalMax: areaSqm * 150,
    unit: "m²",
    spec: "厚度 8-15mm，环保无味",
    note: "可选项，根据实际需求确定",
  };
}

function createSportFloorItem(companySize: number): BudgetItemStrict {
  const areaSqm = Math.ceil((companySize / 200) * 120);
  
  return {
    category: "地面配套",
    name: "运动地板（可选）",
    qtyMin: areaSqm,
    qtyMax: areaSqm,
    priceMin: 200,  // CNY/m²
    priceMax: 400,  // CNY/m²
    subtotalMin: areaSqm * 200,
    subtotalMax: areaSqm * 400,
    unit: "m²",
    spec: "PVC 运动地板或实木复合",
    note: "可选项，根据实际需求确定",
  };
}
```

---

## 📄 Government 级别页面布局

### 第 1 页：封面
```
┌─────────────────────────────────────┐
│  [Logo]  AI Fitness Solution        │
│                                     │
│        企业健身房预算方案           │
│     （政府招标级严格版）             │
│                                     │
│  文档编号：AFS-GOV-20260301-XXX-01  │
│  项目名称：XXX 企业健身房项目       │
│  项目编号：XXX                      │
│  申报单位：XXX                      │
│  编制日期：2026-03-01               │
│                                     │
│                                     │
│          [密级标识]                 │
└─────────────────────────────────────┘
```

### 第 2 页：总览
```
┌─────────────────────────────────────┐
│  一、项目概况                       │
│  - 企业规模：200 人                 │
│  - 预算档位：MID                    │
│  - 建议面积：120 m²                 │
│                                     │
│  二、预算总计（CNY）                │
│  ┌───────────────────────────────┐ │
│  │ 最小值：100,000               │ │
│  │ 最大值：200,000               │ │
│  └───────────────────────────────┘ │
│                                     │
│  三、分项汇总                       │
│  类别      最小值    最大值         │
│  ────────────────────────────────  │
│  有氧设备   30,000   60,000        │
│  力量设备   40,000   80,000        │
│  配件       10,000   20,000        │
│  地面配套   20,000   40,000        │
└─────────────────────────────────────┘
```

### 第 3-4 页：详细清单
```
┌─────────────────────────────────────────────────────────┐
│  四、设备明细清单                                       │
│  序号 类别   名称      数量    单价(CNY)  小计(CNY)  备注│
│  ──────────────────────────────────────────────────────│
│  001  有氧  跑步机    5-8台   8000-12000  40k-96k   商用│
│  002  有氧  椭圆机    3-5台   6000-10000  18k-50k   商用│
│  ...                                                    │
│  020  配件  瑜伽垫    20-30个  50-100    1k-3k      环保│
│  021  地面  橡胶垫    120m²   80-150     9.6k-18k  可选 │
│  ──────────────────────────────────────────────────────│
│  合计                                    100k-200k      │
└─────────────────────────────────────────────────────────┘
```

### 第 5 页：技术规格
```
┌─────────────────────────────────────┐
│  五、技术规格要求                   │
│                                     │
│  1. 有氧设备                        │
│     - 商用级别，承重 150kg+         │
│     - 静音设计，噪音 < 65dB         │
│     - 保修期 ≥ 2 年                 │
│                                     │
│  2. 力量设备                        │
│     - 钢材厚度 ≥ 3mm                │
│     - 表面喷塑处理                  │
│     - 配重片精度 ±2%                │
│                                     │
│  3. 地面配套                        │
│     - 环保认证（国标）              │
│     - 防滑系数 ≥ 0.5                │
│     - 耐磨等级 T 级                 │
└─────────────────────────────────────┘
```

### 第 6 页：附件与签章
```
┌─────────────────────────────────────┐
│  六、附件说明                       │
│  - 附件 1：设备参数表               │
│  - 附件 2：品牌参考清单             │
│  - 附件 3：场地布局图               │
│                                     │
│  七、编制说明                       │
│  本预算方案为初步估算，最终以...   │
│                                     │
│  八、审核签章                       │
│  编制人：_________  日期：_______   │
│  审核人：_________  日期：_______   │
│  批准人：_________  日期：_______   │
│                                     │
│  [单位公章]                         │
└─────────────────────────────────────┘
```

---

## 🔧 实施步骤

### Phase 1: 类型定义（1 天）
- [ ] 创建 `lib/pdf/budget/types.ts`
- [ ] 定义 `BudgetLevel`, `BudgetItemStrict`, `OptionalSurface`
- [ ] 定义 `GovernmentBudgetInput`
- [ ] 实现 `generateDocNumber()`

### Phase 2: 数据处理（2 天）
- [ ] 实现 `buildStrictItems()`
- [ ] 实现 `validateTotals()`
- [ ] 实现 `createRubberMatItem()`, `createSportFloorItem()`
- [ ] 添加单元测试

### Phase 3: Government 渲染器（3-4 天）
- [ ] 创建 `lib/pdf/budget/renderGovernment.ts`
- [ ] 实现第 1 页：封面
- [ ] 实现第 2 页：总览
- [ ] 实现第 3-4 页：详细清单
- [ ] 实现第 5 页：技术规格
- [ ] 实现第 6 页：附件与签章

### Phase 4: 主入口重构（1 天）
- [ ] 修改 `renderBudget.ts` 添加 `level` 参数
- [ ] 实现分流逻辑
- [ ] 保持向后兼容

### Phase 5: 测试与文档（1 天）
- [ ] 创建测试路由 `/api/budget-gov`
- [ ] 视觉回归测试
- [ ] 更新 API 文档

---

## 📝 使用示例

### Brand 级别（现有）
```typescript
const pdfBytes = await renderBudgetPdfBuffer(
  {
    planId: "test-001",
    companyName: "测试企业",
    companySize: 200,
    budgetTier: "mid",
  },
  {
    level: "brand", // 2 页紧凑版
    dateYmd: "2026/03/01",
  }
);
```

### Government 级别（新增）
```typescript
const pdfBytes = await renderBudgetPdfBuffer(
  {
    planId: "attaguy-plan",
    companyName: "XX 市政府机关",
    companySize: 500,
    budgetTier: "high",
    
    // 可选地面
    optionalSurface: {
      rubberMat: true,
      sportFloor: false,
    },
    
    // 项目信息
    projectName: "XX 市政府机关健身房建设项目",
    projectCode: "GOV-2026-001",
    department: "XX 市机关事务管理局",
  },
  {
    level: "government", // 4-6 页政府版
    dateYmd: "2026/03/01",
    reqsig: "abc123...",
  }
);
```

---

## 🎯 关键差异对比

| 特性 | Brand 级别 | Government 级别 |
|------|-----------|----------------|
| 页数 | 2 页 | 4-6 页 |
| 数据结构 | 灵活 | 严格（BudgetItemStrict） |
| 校验 | 无 | 强制总计校验 |
| 编号 | Plan ID | AFS-GOV-YYYYMMDD-PLANID-01 |
| 地面方案 | 不包含 | 可选（橡胶垫/运动地板） |
| 技术规格 | 无 | 详细要求 |
| 签章区 | 无 | 有 |
| 单位 | CNY | CNY |
| 适用场景 | 商业快速报价 | 政府招标投标 |

---

## 🔗 相关文件

- 当前实现：`lib/pdf/budgetRender.ts`
- 主题系统：`lib/pdf/theme.ts`
- 数据源：`lib/services/budgetService.ts`
- 测试路由：`app/api/budget/route.ts`
