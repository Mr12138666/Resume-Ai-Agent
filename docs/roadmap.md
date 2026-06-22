# Roadmap

## Phase 0: Architecture Foundation

Goal: Lock project boundaries before generating large amounts of code.

Deliverables:

- Architecture document
- Technology stack decision
- API design
- Backend/frontend/deploy workspace layout
- Docker Compose infrastructure plan

## Phase 1: Backend Skeleton

Goal: Create a runnable Spring Boot backend.

Deliverables:

- Maven or Gradle project
- Java 21
- Spring Boot web API
- Spring AI dependencies
- PostgreSQL, Flyway, JPA
- Health/status endpoints
- OpenAPI docs
- Basic exception handling

Suggested packages:

```text
com.resumeai.interfaces
com.resumeai.application
com.resumeai.domain
com.resumeai.infrastructure
com.resumeai.agent
```

## Phase 2: Document Upload and Parsing

Goal: Support raw resume ingestion.

Deliverables:

- Upload PDF/DOCX/TXT
- Save file in MinIO
- Extract text with Tika/PDFBox/docx4j
- Store parsed Markdown/plain text
- LLM structured extraction into resume JSON

Acceptance:

- Upload at least one PDF and one DOCX sample
- Persist raw file metadata
- Persist parsed text
- Return structured resume sections

## Phase 3: Job Description and Matching

Goal: Analyze resume fit against a target JD.

Deliverables:

- Create JD
- Extract structured requirements
- Keyword match score
- Embedding semantic score
- LLM match report
- Evidence map from requirement to resume section

Acceptance:

- A user can upload a resume, paste JD, and receive a score plus missing requirements.

## Phase 4: RAG Knowledge Base

Goal: Use PGvector to improve analysis quality.

Deliverables:

- Knowledge document CRUD
- Chunking
- Embedding generation
- PGvector storage
- RAG retrieval during analysis
- Built-in seed docs for resume writing rules and ATS guidance

Acceptance:

- Analysis prompt includes retrieved guidance chunks.
- Vector search can be tested independently.

## Phase 5: Rewrite Studio

Goal: Generate useful, faithful resume rewrites.

Deliverables:

- Rewrite selected resume sections
- Show original vs generated text
- Explain why changes were made
- Verify generated rewrite does not invent facts
- Accept/reject rewrite drafts

Acceptance:

- User can improve a project experience bullet list for a target JD.

## Phase 6: Frontend Product Shell

Goal: Build a usable web workflow.

Deliverables:

- Dashboard
- Upload page
- Analysis report page
- Rewrite Studio
- Settings page
- SSE progress display

Acceptance:

- User can complete the MVP workflow without API tools.

## Phase 7: Export

Goal: Produce polished application artifacts.

Deliverables:

- Markdown export
- PDF export
- Optional DOCX export
- Resume template selection

Acceptance:

- User can download an optimized resume.

## Phase 8: Agent and Tool Hardening

Goal: Make the AI workflow more explicit and demonstrable.

Deliverables:

- Spring AI tool definitions
- Single orchestrating resume optimization agent
- Tool call logging
- Prompt versioning
- Model/provider settings

Acceptance:

- Demo can show agent invoking tools for parsing, retrieval, scoring, and rewriting.

## Phase 9: Quality and Demo Polish

Goal: Prepare for presentation or submission.

Deliverables:

- Sample data
- Seed knowledge documents
- README run guide
- Screenshots
- Testcontainers integration tests
- Frontend smoke tests
- Demo script
