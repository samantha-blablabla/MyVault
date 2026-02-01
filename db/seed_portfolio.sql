-- Clean slate
DELETE FROM transactions;
DELETE FROM market_signals;

-- Seed Transactions (User Portfolio)
-- TCB: 100 cp, Price 35784
-- HPG: 20 cp, Price 26600
-- MBB: 100 cp, Price 27210
-- DFIX: 167.52 ccq, Price 11938
-- VNDAF: 202.82 ccq, Price 19721

INSERT INTO transactions (id, user_id, date, symbol, type, quantity, price, notes) VALUES
('seed-tcb', 'user-default', '2024-01-01T00:00:00Z', 'TCB', 'BUY', 100, 35784, 'Sync from Trading App'),
('seed-hpg', 'user-default', '2024-01-01T00:00:00Z', 'HPG', 'BUY', 20, 26600, 'Sync from Trading App'),
('seed-mbb', 'user-default', '2024-01-01T00:00:00Z', 'MBB', 'BUY', 100, 27210, 'Sync from Trading App'),
('seed-dfix', 'user-default', '2024-01-01T00:00:00Z', 'DFIX', 'BUY', 167.52, 11968, 'Dragon Capital Funds'),
('seed-vndaf', 'user-default', '2024-01-01T00:00:00Z', 'VNDAF', 'BUY', 202.82, 19910, 'VNDirect Active Fund');

-- Seed Market Signals (Current Prices)
-- TCB: 35.900, +0.32%
-- HPG: 26.800, +0.75%
-- MBB: 27.200, -0.04%
-- DFIX: 11.968, +0.25%
-- VNDAF: 19.910, +0.96%

INSERT INTO market_signals (symbol, price, change, rsi, volume_state, note, updated_at) VALUES 
('TCB', 35900, 0.32, 60, 'ACCUMULATING', 'Updated via Seed', strftime('%s', 'now')),
('HPG', 26800, 0.75, 55, 'ACCUMULATING', 'Updated via Seed', strftime('%s', 'now')),
('MBB', 27200, -0.04, 50, 'DISTRIBUTING', 'Updated via Seed', strftime('%s', 'now')),
('DFIX', 11968, 0.25, 50, 'ACCUMULATING', 'Updated via Seed', strftime('%s', 'now')),
('VNDAF', 19910, 0.96, 65, 'PUMPING', 'Updated via Seed', strftime('%s', 'now'));
