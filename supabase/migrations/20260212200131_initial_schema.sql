-- Creators
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL UNIQUE,
  creator_code TEXT NOT NULL UNIQUE,
  api_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  libraries TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game content stored separately to keep metadata queries fast
CREATE TABLE game_content (
  game_id UUID PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
  html TEXT NOT NULL,
  content_hash TEXT NOT NULL
);

-- Simple likes (one per session, no auth needed)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, session_id)
);

-- Reports for content moderation
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_games_creator ON games(creator_id);
CREATE INDEX idx_games_created ON games(created_at DESC);
CREATE INDEX idx_games_play_count ON games(play_count DESC);
CREATE INDEX idx_games_slug ON games(slug);
