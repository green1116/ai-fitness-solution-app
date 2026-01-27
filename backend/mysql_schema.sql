-- ============================================
-- MySQL 数据库 Schema（生产环境推荐）
-- ============================================
-- 适用于 MySQL 5.7+ 或 MariaDB 10.2+
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(64) UNIQUE NOT NULL,
  amount INT NOT NULL, -- cents
  currency VARCHAR(8) DEFAULT 'CNY',
  status ENUM('pending','paid','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  pay_meta JSON NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  submission_no VARCHAR(64) UNIQUE NOT NULL,
  order_no VARCHAR(64),
  answers JSON NOT NULL,
  status ENUM('waiting','in_progress','done') DEFAULT 'waiting',
  result_url VARCHAR(1024),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
