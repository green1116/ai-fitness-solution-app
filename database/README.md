# 数据库结构

## 表结构说明

### orders（付费订单表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| order_no | VARCHAR(64) | 订单号，唯一 |
| user_id | BIGINT | 用户ID（可为空） |
| amount | INT | 金额（分） |
| currency | VARCHAR(8) | 货币，默认 CNY |
| status | ENUM | 订单状态：pending, paid, cancelled |
| created_at | TIMESTAMP | 创建时间 |
| paid_at | TIMESTAMP | 支付时间（可为空） |
| pay_meta | JSON | 支付元数据（可为空） |

### submissions（提交的判断信息表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| order_id | BIGINT | 关联订单ID（可为空） |
| name | VARCHAR(255) | 提交人姓名（可为空） |
| email | VARCHAR(255) | 提交人邮箱（可为空） |
| data | JSON | 提交数据（JSON格式） |
| status | ENUM | 处理状态：waiting, in_progress, done |
| result_url | VARCHAR(1024) | 结果URL（可为空） |
| created_at | TIMESTAMP | 创建时间 |

## 使用方法

### 初始化数据库

```bash
mysql -u your_username -p your_database < database/init.sql
```

或者在 MySQL 客户端中执行：

```sql
SOURCE database/init.sql;
```

### 字段说明

- **orders.amount**：金额以分为单位存储（避免浮点数精度问题）
- **orders.status**：
  - `pending`：待支付
  - `paid`：已支付
  - `cancelled`：已取消
- **submissions.status**：
  - `waiting`：等待处理
  - `in_progress`：处理中
  - `done`：已完成
- **data/pay_meta**：JSON 字段，可存储任意结构化数据

