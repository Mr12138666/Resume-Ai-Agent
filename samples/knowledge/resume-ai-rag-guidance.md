# Resume AI RAG Guidance

Use this document as a manual RAG source in the knowledge workbench.

## ATS Keyword Alignment

- Mirror exact JD keywords only when the candidate has truthful supporting evidence.
- Put the most role-relevant backend keywords in the summary, skills, and recent project bullets.
- Prefer standard section titles such as Summary, Skills, Experience, Projects, and Education.
- Avoid unsupported claims such as Kubernetes, production scale, or distributed tracing unless the resume proves them.

## Backend Engineering Bullet Pattern

Strong backend resume bullets should follow this pattern:

Action verb + technical scope + system/component + evidence/result.

Examples:

- Built Spring Boot REST APIs for document upload and parsing, storing raw files in MinIO and processing metadata in PostgreSQL.
- Designed Flyway-backed PostgreSQL schemas for traceable analysis records and generated rewrite artifacts.
- Integrated Redis health checks and caching to improve dashboard reliability for frequently accessed metadata.

## AI Application Evidence

For AI application roles, look for evidence of:

- Prompt engineering and OpenAI-compatible model integration.
- RAG retrieval with PGvector or another vector database.
- Tool calling or agent workflows.
- Fallback behavior when model calls fail.
- Grounding generated text in source resume/JD evidence.
- Clear separation between parsing, scoring, rewriting, and export artifacts.

## Faithful Rewrite Rules

- Do not invent employers, dates, metrics, scale, or technologies.
- If a missing JD keyword has no evidence, suggest a learning or project gap instead of inserting it into the resume.
- When no metric exists, use concrete scope and outcome rather than fake numbers.
- Preserve the candidate's original facts while improving specificity, action verbs, and role alignment.
