ALTER TABLE rewrite_drafts
    ADD COLUMN conversation_history JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN regenerated_count INTEGER NOT NULL DEFAULT 0;
