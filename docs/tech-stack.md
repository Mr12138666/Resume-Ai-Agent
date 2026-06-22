# Technology Stack

## Backend Recommendation

Use Java 21, Spring Boot 4.1, and Spring AI 2.0 as the primary backend stack.

This matches the project goal because it can show:

- Model deployment and invocation
- Prompt engineering
- Generic document parsing
- RAG with PGvector
- Tool calling
- Agent-style orchestration
- Production-like service layering

## Backend Choices

| Area | Recommended Choice | Why |
|---|---|---|
| Runtime | Java 21 | Modern LTS, strong Spring ecosystem |
| Framework | Spring Boot 4.1 | Modern Spring runtime already used by the backend |
| AI framework | Spring AI | Native Java integration for ChatClient, VectorStore, Advisors, Tool Calling |
| API style | REST + SSE | REST for normal operations, SSE for streaming AI progress |
| Database | PostgreSQL | Reliable relational store |
| Vector search | PGvector | Keeps vector and relational data together |
| ORM | Spring Data JPA | Simple domain persistence |
| Migration | Flyway | Repeatable database setup |
| Document parsing | Apache Tika + PDFBox + docx4j | PDF/DOCX/TXT parsing in Java |
| Object storage | MinIO | Stores original and exported files |
| Cache/progress | Redis/ReBloom | Health-checked now; useful for async progress, SSE state, and Bloom-filter dedupe later |
| API docs | REST contract documents | Frontend/backend contract visibility |
| Testing | JUnit 5 | Covers parser and core service behavior |

## Spring AI Components

Use these Spring AI capabilities deliberately:

- `ChatClient`: central LLM invocation API
- Structured output converters: resume/JD JSON extraction
- `VectorStore`: PGvector integration
- Advisors: RAG context injection
- Tool Calling: expose backend functions to LLM workflows
- Model provider abstraction: OpenAI-compatible APIs and Ollama

## LLM Provider Strategy

Support provider abstraction from the start, but only implement two providers in MVP:

- OpenAI-compatible HTTP API for cloud models
- Ollama for local deployment

This gives a clean story for both deployed model calls and local privacy-first runs.

Suggested config:

```yaml
resume-ai:
  llm:
    provider: openai-compatible
    model: gpt-4o-mini
    base-url: https://api.openai.com
  embedding:
    provider: openai-compatible
    model: text-embedding-3-small
```

For Ollama:

```yaml
resume-ai:
  llm:
    provider: ollama
    model: llama3.1
    base-url: http://localhost:11434
  embedding:
    provider: ollama
    model: nomic-embed-text
```

## Frontend Recommendation

Use Next.js with TypeScript.

| Area | Recommended Choice | Why |
|---|---|---|
| Framework | Next.js | Good routing, product pages, SSR where needed |
| Language | TypeScript | Safer frontend API contracts |
| Styling | Tailwind CSS | Fast systemized UI |
| Components | Local component primitives | Keep the product UI small and easy to audit |
| Data fetching | Native `fetch` wrapper | Matches the current API surface without extra state libraries |
| Local state | React state | Enough for the current single-user workflow |
| Forms | Controlled React forms | Keeps dependencies minimal until validation needs grow |
| Upload | Native file input | Works for PDF/DOCX/TXT without an additional upload library |
| Charts | CSS/SVG primitives | Current score cards and rings are custom components |

## Why Not Vue or Plain React

Vue is viable, but the copied reference project is already Next.js-shaped, and Resume Builder style workflows benefit from Next.js routing and React ecosystem libraries.

Plain Vite React is lighter, but Next.js gives a more complete app structure for dashboard, builder, print/export routes, and future auth.

## Database Split

Use PostgreSQL for:

- Users
- Resumes
- Parsed resume sections
- Job descriptions
- Analyses
- Suggestions
- Rewrite drafts
- Export records
- Knowledge documents
- Vector chunks with PGvector

Use MinIO for:

- Original uploaded files
- Generated PDF/DOCX
- Large intermediate artifacts if needed

Use Redis for:

- Async job progress
- SSE stream coordination
- Short-lived provider health cache
- Optional Bloom-filter dedupe with ReBloom

## Prompt Engineering Strategy

Keep prompts versioned as backend resources:

```text
backend/src/main/resources/prompts/
  resume-structure.st
  job-structure.st
  match-analysis.st
  rewrite-section.st
  verify-faithfulness.st
```

Each prompt should define:

- Role
- Input schema
- Output JSON schema
- Constraints
- Examples
- Safety rules around not inventing experience

## Testing Strategy

Prioritize these tests:

- Parser tests with sample PDF/DOCX/TXT files
- Prompt contract tests with fixed LLM responses
- Repository tests against PostgreSQL + PGvector
- API tests for upload/analyze/rewrite flows
- Frontend component tests for analysis and rewrite views

Avoid relying only on live LLM calls for correctness.

## Deployment Strategy

Local development:

- Docker Compose can start PostgreSQL/PGvector, Redis, MinIO, and Ollama
- Backend runs from IDE or Maven
- Frontend runs with pnpm/npm dev

Release deployment:

- Backend container
- Frontend container
- PostgreSQL/PGvector
- Redis/ReBloom for async progress and dedupe
- MinIO
- Optional Ollama GPU machine or cloud OpenAI-compatible model provider
