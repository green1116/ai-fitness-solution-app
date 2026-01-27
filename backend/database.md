# 数据库配置指南

## SQLite（开发环境）

默认使用 SQLite，零配置即可运行。

**数据库文件：** `mvp.db`（自动创建）

**初始化：** 无需手动初始化，首次运行 `app.js` 会自动创建表结构。

---

## MySQL（生产环境推荐）

### 1. 创建数据库

```sql
CREATE DATABASE ai_judgment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_judgment;
```

### 2. 执行 Schema

```bash
mysql -u your_user -p ai_judgment < mysql_schema.sql
```

或在 MySQL 客户端中：

```sql
SOURCE mysql_schema.sql;
```

### 3. 配置连接

在 `.env` 文件中添加：

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=ai_judgment
```

或在 `app.js` 中直接配置：

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_judgment',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

---

## 表结构说明

### users（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| email | VARCHAR(255) | 邮箱（唯一） |
| name | VARCHAR(255) | 姓名 |
| created_at | TIMESTAMP | 创建时间 |

### orders（订单表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| order_no | VARCHAR(64) | 订单号（唯一） |
| user_id | BIGINT | 用户ID（外键，可为空） |
| amount | INT | 金额（分） |
| currency | VARCHAR(8) | 货币，默认 CNY |
| status | ENUM | 订单状态：pending, paid, cancelled |
| created_at | TIMESTAMP | 创建时间 |
| paid_at | TIMESTAMP | 支付时间（可为空） |
| pay_meta | JSON | 支付元数据（可为空） |

### submissions（提交记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| submission_no | VARCHAR(64) | 提交编号（唯一） |
| order_no | VARCHAR(64) | 关联订单号（外键，可为空） |
| user_id | BIGINT | 关联用户ID（外键，可为空） |
| answers | JSON | 答案（JSON格式） |
| status | ENUM | 处理状态：waiting, in_progress, done |
| result_url | VARCHAR(1024) | 结果URL（可为空） |
| created_at | TIMESTAMP | 创建时间 |

---

## 索引说明

所有表都包含必要的索引以优化查询性能：

- **主键索引**：所有表的 `id` 字段
- **唯一索引**：`users.email`、`orders.order_no`、`submissions.submission_no`
- **外键索引**：`orders.user_id`、`submissions.order_no`、`submissions.user_id`
- **状态索引**：`orders.status`、`submissions.status`
- **时间索引**：所有表的 `created_at`

---

## 迁移建议

### 从 SQLite 迁移到 MySQL

1. **导出 SQLite 数据**

```bash
sqlite3 mvp.db .dump > backup.sql
```

2. **转换数据格式**

需要手动调整 SQL 格式，特别是：
- 日期时间格式
- 布尔值
- JSON 字段

3. **导入到 MySQL**

```bash
mysql -u user -p database < converted_backup.sql
```

---

## 备份建议

### MySQL 备份

```bash
# 完整备份
mysqldump -u user -p ai_judgment > backup_$(date +%Y%m%d).sql

# 只备份结构
mysqldump -u user -p --no-data ai_judgment > schema_backup.sql

# 只备份数据
mysqldump -u user -p --no-create-info ai_judgment > data_backup.sql
```

### 恢复

```bash
mysql -u user -p ai_judgment < backup_20260120.sql
```

---

## 性能优化

1. **连接池配置**：建议设置适当的连接池大小
2. **查询优化**：使用 EXPLAIN 分析慢查询
3. **索引优化**：根据实际查询模式调整索引
4. **分区**：如果数据量很大，考虑按时间分区

---

## 注意事项

- **字符集**：使用 `utf8mb4` 以支持完整的 Unicode（包括 emoji）
- **外键约束**：使用 `ON DELETE SET NULL` 确保数据一致性
- **JSON 字段**：MySQL 5.7+ 支持原生 JSON 类型，可以高效查询
- **时区**：确保服务器时区设置正确，避免时间戳问题

