ALTER TABLE games ADD COLUMN forked_from UUID REFERENCES games(id) ON DELETE SET NULL;
CREATE INDEX idx_games_forked_from ON games(forked_from) WHERE forked_from IS NOT NULL;

CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_config (key, value) VALUES ('jam_theme', 'UNDERWATER');
