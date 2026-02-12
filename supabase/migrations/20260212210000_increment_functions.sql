-- Atomic increment functions to avoid race conditions on count updates

CREATE OR REPLACE FUNCTION increment_play_count(game_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE games SET play_count = play_count + 1 WHERE id = game_id_input;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_like_count(game_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE games SET like_count = like_count + 1 WHERE id = game_id_input;
END;
$$ LANGUAGE plpgsql;
