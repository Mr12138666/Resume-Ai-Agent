# Resume AI Agent

Resume AI Agent is a Java-first rewrite plan for an AI resume optimization platform inspired by `srbhr/Resume-Matcher`.

The target product helps job seekers upload an original resume and a target job description, then analyzes fit, explains gaps, and rewrites selected resume sections with LLM, RAG, and agent/tool workflows.

## Workspace Layout

```text
Resume-Ai-Agent/
  backend/     # Java + Spring Boot + Spring AI service
  frontend/    # Web app workspace
  deploy/      # Local infrastructure and deployment assets
  docs/        # Architecture, stack, API, and roadmap documents
  samples/     # Demo resume, JD, and RAG knowledge inputs
  参考/        # Upstream reference project copied by the user
```

## Implemented Stack

- Backend: Java 21, Spring Boot 4.1, Spring AI 2.0, Spring Data JPA, PostgreSQL, PGvector, Flyway, Redis, MinIO
- AI: Spring AI ChatClient, PGVectorStore, Tool Calling, OpenAI-compatible providers, Ollama embeddings
- Document parsing: Apache Tika, PDFBox, docx4j
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Current remote infrastructure: PostgreSQL/PGvector, Redis, and MinIO exposed through FRP

## Current Status

The MVP is now runnable as a front/back separated platform:

- Resume upload to MinIO and text extraction with Apache Tika
- JD creation and structure extraction through Spring AI
- Resume/JD matching with keyword evidence, scores, suggestions, and optional RAG guidance
- RAG knowledge document creation, indexing, and search with PGvector
- Agent-style rewrite endpoint using Spring AI tool calling with a safe fallback
- Markdown export to MinIO with presigned download URLs
- Frontend pages for dashboard, upload workflow, object details, demo smoke, settings, and RAG workbench

## Run Locally

Backend:

```powershell
.\scripts\start-backend.ps1
```

Frontend:

```powershell
.\scripts\start-frontend.ps1 -Install
```

Open `http://localhost:3000`.

The backend loads configuration through Spring Boot `application.yml`. It optionally imports root `.env` and `backend/src/main/resources/application-private.yml`, so IntelliJ IDEA and PowerShell runs use the same config path. Keep real secrets in ignored local files, not in committed YAML.

## Demo Paths

Real workflow:

1. Open `/upload`.
2. Upload `samples/resumes/java-backend-resume.txt`.
3. Paste `samples/jobs/senior-java-ai-backend-jd.txt` and create an analysis.
4. Open the full analysis page.
5. Create a rewrite draft.
6. Open the rewrite page and export Markdown.

Fast smoke workflow:

1. Open `/demo`.
2. Click `Run demo smoke`.
3. Open generated resume, JD, analysis, and rewrite records.
4. Download the generated Markdown export.

Configuration visibility:

- `/settings` shows model/provider, RAG, MinIO, Redis, and runtime status without exposing secrets.
- `/knowledge` manages RAG source documents and vector search.
- [Demo Script](docs/demo-script.md) gives a complete presentation flow using the sample files.

See:

- [Architecture](docs/architecture.md)
- [Technology Stack](docs/tech-stack.md)
- [API Design](docs/api-design.md)
- [Roadmap](docs/roadmap.md)
