CREATE TABLE IF NOT EXISTS conversation_turns (
  turn_id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  site_host TEXT NOT NULL,
  page_path TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('chat', 'dictation', 'voice_call')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('answered', 'refused', 'error')),
  status_code INTEGER NOT NULL,
  sources_json TEXT NOT NULL DEFAULT '[]',
  cache_status TEXT,
  model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  created_at_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS conversation_turns_by_conversation ON conversation_turns (conversation_id, created_at_ms);
CREATE INDEX IF NOT EXISTS conversation_turns_by_date ON conversation_turns (created_at_ms);
CREATE INDEX IF NOT EXISTS conversation_turns_by_site ON conversation_turns (site_host, created_at_ms);
