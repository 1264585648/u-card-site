-- Cloudflare D1 / SQLite Database Schema for U-Card Catalog

-- 1. 卡片主表 (核心资产数据存储)
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    network TEXT NOT NULL,
    issuer TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    bin TEXT,
    card_art_color TEXT,
    card_image TEXT,
    fees_json TEXT NOT NULL,
    kyc_json TEXT NOT NULL,
    open_json TEXT NOT NULL,
    scenarios_json TEXT NOT NULL,
    referral_url TEXT,
    promo_badge TEXT,
    is_recommended INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引：优化列表筛选与检索性能
CREATE INDEX IF NOT EXISTS idx_cards_network ON cards(network);
CREATE INDEX IF NOT EXISTS idx_cards_issuer ON cards(issuer);
CREATE INDEX IF NOT EXISTS idx_cards_active ON cards(is_active);
CREATE INDEX IF NOT EXISTS idx_cards_recommended ON cards(is_recommended);

-- 2. 社区测活与投票持久化表
CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT NOT NULL,
    scenario_key TEXT NOT NULL,
    is_success INTEGER NOT NULL, -- 1 为成功，0 为失败
    reason TEXT,
    ip_hash TEXT,                -- 客户端 IP 哈希，用于频控与防刷
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- 索引：快速聚合某卡某场景的最新投票统计
CREATE INDEX IF NOT EXISTS idx_votes_card_scenario ON votes(card_id, scenario_key);
CREATE INDEX IF NOT EXISTS idx_votes_ip_created ON votes(ip_hash, created_at);
