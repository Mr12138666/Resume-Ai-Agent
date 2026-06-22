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
- Frontend pages for dashboard, upload workflow, and RAG workbench

See:

- [Architecture](docs/architecture.md)
- [Technology Stack](docs/tech-stack.md)
- [API Design](docs/api-design.md)
- [Roadmap](docs/roadmap.md)
