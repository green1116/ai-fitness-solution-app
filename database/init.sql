-- ============================================
-- 数据库：最小表结构（MySQL）
-- ============================================

-- 付费订单
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(64) UNIQUE NOT NULL,
  user_id BIGINT NULL,
  amount INT NOT NULL COMMENT '金额（分）',
  currency VARCHAR(8) DEFAULT 'CNY' COMMENT '货币',
  status ENUM('pending','paid','cancelled') DEFAULT 'pending' COMMENT '订单状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  paid_at TIMESTAMP NULL COMMENT '支付时间',
  pay_meta JSON NULL COMMENT '支付元数据（JSON）',
  INDEX idx_order_no (order_no),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='付费订单表';

-- 提交的判断信息
CREATE TABLE IF NOT EXISTS submissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NULL COMMENT '关联订单ID',
  name VARCHAR(255) NULL COMMENT '提交人姓名',
  email VARCHAR(255) NULL COMMENT '提交人邮箱',
  data JSON NOT NULL COMMENT '提交数据（JSON）',
  status ENUM('waiting','in_progress','done') DEFAULT 'waiting' COMMENT '处理状态',
  result_url VARCHAR(1024) NULL COMMENT '结果URL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_order_id (order_id),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提交的判断信息表';

