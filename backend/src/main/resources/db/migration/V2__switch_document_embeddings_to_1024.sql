DROP INDEX IF EXISTS idx_document_chunks_embedding;

TRUNCATE TABLE document_chunks;

ALTER TABLE document_chunks
    ALTER COLUMN embedding TYPE vector(1024);

CREATE INDEX idx_document_chunks_embedding
    ON document_chunks
    USING hnsw (embedding vector_cosine_ops);
