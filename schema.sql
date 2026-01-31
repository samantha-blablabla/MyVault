DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS targets;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS market_signals;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date TEXT NOT NULL,
  symbol TEXT,
  type TEXT NOT NULL, -- BUY, SELL, EXPENSE, INCOME
  quantity REAL DEFAULT 0,
  price REAL NOT NULL,
  notes TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE targets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  symbol TEXT NOT NULL,
  target_quantity REAL NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE bills (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  due_day INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT 0,
  category TEXT,
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE market_signals (
  symbol TEXT PRIMARY KEY,
  price REAL,
  change REAL,
  rsi REAL,
  volume_state TEXT, -- PUMPING, ACCUMULATING, DISTRIBUTING
  note TEXT,
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Seed initial data for Market Signals
INSERT INTO market_signals (symbol, price, change, rsi, volume_state, note) VALUES 
('TCB', 48500, 2.5, 78, 'PUMPING', 'Dòng tiền lớn nhập cuộc'),
('CTR', 112000, -0.5, 42, 'ACCUMULATING', 'Cạn cung - Tích lũy đẹp'),
('FPT', 135000, 0.2, 85, 'DISTRIBUTING', 'Cảnh báo: Tăng giá không kèm Vol');
