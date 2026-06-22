# API Design

Base path: `/api/v1`

## API Principles

- Keep upload, parsing, analysis, rewrite, and export as separate concepts.
- Long-running AI operations should support polling and SSE streaming.
- Store raw files, parsed text, structured JSON, and generated outputs as traceable artifacts.
- Return stable IDs so the frontend can build multi-step workflows.

## Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/status` | DB, vector store, object storage, LLM provider, and agent tool status |

## Resume APIs

| Method | Path | Description |
|---|---|---|
| POST | `/resumes` | Upload PDF/DOCX/TXT resume |
| GET | `/resumes` | List resumes |
| GET | `/resumes/{resumeId}` | Get resume metadata and structured content |
| DELETE | `/resumes/{resumeId}` | Delete resume |
| POST | `/resumes/{resumeId}/parse` | Parse and structure a resume |
| PATCH | `/resumes/{resumeId}/sections/{sectionId}` | Update a structured section |

### Upload Resume

Request: `multipart/form-data`

```text
file: PDF/DOCX/TXT
title: optional
language: zh-CN | en-US
```

Response:

```json
{
  "id": "uuid",
  "title": "resume",
  "originalFilename": "resume.pdf",
  "contentType": "application/pdf",
  "status": "PARSED",
  "rawTextLength": 1234,
  "rawTextPreview": "Preview text...",
  "createdAt": "2026-06-22T10:00:00Z",
  "updatedAt": "2026-06-22T10:00:00Z"
}
```

## Job Description APIs

| Method | Path | Description |
|---|---|---|
| POST | `/jobs` | Create a target job description |
| GET | `/jobs/{jobId}` | Get job description and extracted requirements |
| POST | `/jobs/{jobId}/parse` | Extract structured requirements |

### Create Job

```json
{
  "title": "Java Backend Engineer",
  "company": "Example Corp",
  "description": "Full job description text...",
  "language": "zh-CN"
}
```

## Analysis APIs

| Method | Path | Description |
|---|---|---|
| POST | `/analyses` | Create resume-to-job analysis |
| GET | `/analyses` | List recent analysis reports |
| GET | `/analyses/{analysisId}` | Get full analysis report |
| GET | `/analyses/{analysisId}/events` | SSE stream for progress |

### Create Analysis

```json
{
  "resumeId": "uuid",
  "jobId": "uuid",
  "options": {
    "useRag": true,
    "includeAtsScore": true,
    "language": "zh-CN"
  }
}
```

Response:

```json
{
  "analysisId": "uuid",
  "status": "QUEUED"
}
```

### Analysis Report Shape

```json
{
  "analysisId": "uuid",
  "overallScore": 78,
  "keywordScore": 72,
  "semanticScore": 81,
  "atsScore": 76,
  "matchedRequirements": [],
  "missingRequirements": [],
  "sectionSuggestions": [],
  "evidenceMap": []
}
```

## Rewrite APIs

| Method | Path | Description |
|---|---|---|
| POST | `/analyses/{analysisId}/rewrites` | Generate rewrite drafts |
| GET | `/rewrites` | List rewrite drafts |
| GET | `/rewrites/{rewriteId}` | Get rewrite draft |
| POST | `/rewrites/{rewriteId}/accept` | Accept rewrite into resume draft |
| POST | `/rewrites/{rewriteId}/reject` | Reject rewrite |

### Generate Rewrite

```json
{
  "sectionIds": ["uuid"],
  "style": "professional",
  "targetLanguage": "zh-CN",
  "constraints": {
    "doNotInventExperience": true,
    "preserveFacts": true,
    "preferQuantifiedImpact": true
  }
}
```

## Knowledge Base APIs

| Method | Path | Description |
|---|---|---|
| POST | `/knowledge/documents` | Upload or create RAG source document |
| GET | `/knowledge/documents` | List knowledge documents |
| POST | `/knowledge/documents/{documentId}/index` | Chunk and embed document |
| DELETE | `/knowledge/documents/{documentId}` | Delete document and chunks |
| POST | `/knowledge/search` | Search vector knowledge base |

## Export APIs

| Method | Path | Description |
|---|---|---|
| POST | `/exports` | Create PDF/DOCX/Markdown export |
| GET | `/exports/{exportId}` | Get export metadata |
| GET | `/exports/{exportId}/download` | Download generated file |

## Settings APIs

| Method | Path | Description |
|---|---|---|
| GET | `/settings/llm` | Get model provider settings |
| PUT | `/settings/llm` | Update provider/model/base URL |
| POST | `/settings/llm/test` | Test model connection |

## SSE Event Types

```text
analysis.started
analysis.parsing_resume
analysis.parsing_job
analysis.retrieving_context
analysis.scoring
analysis.generating_suggestions
analysis.completed
analysis.failed
rewrite.started
rewrite.delta
rewrite.completed
rewrite.failed
```

## Error Shape

```json
{
  "code": "RESUME_PARSE_FAILED",
  "message": "Could not parse the uploaded resume.",
  "traceId": "uuid"
}
```
