ALTER TABLE conversation_turns ADD COLUMN assistant_kind TEXT NOT NULL DEFAULT 'ai_twin';
CREATE INDEX IF NOT EXISTS conversation_turns_by_assistant ON conversation_turns (assistant_kind, created_at_ms);
