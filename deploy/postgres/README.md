# PostgreSQL and PGvector

The local database uses the `pgvector/pgvector` image.

Flyway migrations live in:

```text
backend/src/main/resources/db/migration
```

The first migration enables the `vector` extension and creates the core tables for resumes, job descriptions, analyses, rewrite drafts, knowledge documents, and vector chunks.
