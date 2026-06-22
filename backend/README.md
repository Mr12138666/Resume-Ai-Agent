# Backend

This directory is reserved for the Java backend rewrite.

## Target Stack

- Java 21
- Spring Boot 3.x
- Spring AI
- Spring Web
- Spring Data JPA
- PostgreSQL + PGvector
- Flyway
- Redis
- MinIO
- Apache Tika, PDFBox, docx4j
- springdoc-openapi
- JUnit 5 + Testcontainers

## Intended Package Layout

```text
com.resumeai
  interfaces
  application
  domain
  infrastructure
  agent
```

## First Implementation Milestone

Create a runnable Spring Boot app with:

- `GET /api/v1/health`
- `GET /api/v1/status`
- PostgreSQL connection
- Flyway migration
- OpenAPI UI
- Spring AI provider configuration

Then implement document upload and parsing.

## Implemented MVP Slice

- `POST /api/v1/resumes`: upload a PDF/DOCX/TXT resume as `multipart/form-data`.
- `GET /api/v1/resumes`: list uploaded resumes.
- `GET /api/v1/resumes/{resumeId}`: fetch parsed resume metadata and text preview.
- Raw files are stored in MinIO.
- Text extraction uses Apache Tika with auto-detection.
- Resume metadata and parsed raw text are stored in PostgreSQL.
