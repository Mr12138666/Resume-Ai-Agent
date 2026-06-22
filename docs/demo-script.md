# Demo Script

This script runs the real product workflow with stable sample data.

## Before Demo

1. Confirm root `.env` points to the intended PostgreSQL/PGvector, MinIO, Redis, and model provider.
2. Start the backend:

```powershell
.\scripts\start-backend.ps1
```

3. Start the frontend in another terminal:

```powershell
.\scripts\start-frontend.ps1 -Install
```

4. Open `http://localhost:3000/settings` and confirm database, storage, Redis, RAG, and model settings are visible.

## Optional RAG Setup

The backend seeds several knowledge documents on startup. For a visible RAG demo:

1. Open `http://localhost:3000/knowledge`.
2. Click `Index` for the seeded documents.
3. Create another document using `samples/knowledge/resume-ai-rag-guidance.md`.
4. Index it.
5. Search for `How should I rewrite backend engineering resume bullets for an AI document platform?`.

If embedding configuration is unavailable, keep the upload workflow moving by disabling `Use RAG guidance` on `/upload`.

## Real Upload Workflow

1. Open `http://localhost:3000/upload`.
2. Upload `samples/resumes/java-backend-resume.txt`.
3. Use title `Sample Java Backend Resume`.
4. Paste `samples/jobs/senior-java-ai-backend-jd.txt` into the JD box.
5. Use role title `Senior Java Backend Engineer`.
6. Use company `Demo Cloud`.
7. Keep `Use RAG guidance` enabled if knowledge indexing is ready.
8. Click `Create analysis`.

Expected talking points:

- The backend stores the original file in MinIO.
- Apache Tika extracts text.
- PostgreSQL stores resume, JD, analysis, and rewrite records.
- The analysis report shows scores, matched keywords, missing keywords, suggestions, evidence, and optional RAG guidance.

## Rewrite And Export

1. Click `Open analysis`.
2. Review scores, missing keywords, suggestions, evidence map, and RAG guidance.
3. Click `Create rewrite`.
4. Click `Open draft`.
5. Compare original and rewritten text.
6. Click `Export Markdown`.
7. Download the generated Markdown artifact from the presigned MinIO URL.

Expected talking points:

- The rewrite flow uses Spring AI ChatClient and tool calling when available.
- The fallback path keeps the demo reliable if the LLM provider is unavailable.
- The verification JSON is shown beside the generated draft.
- Markdown export demonstrates the artifact pipeline from rewrite result to MinIO download.

## Fast Smoke Workflow

Use this when time is short or when external model calls are unstable:

1. Open `http://localhost:3000/demo`.
2. Click `Run demo smoke`.
3. Open the generated resume, JD, analysis, and rewrite records.
4. Download the Markdown export.

This path creates records and an export directly through the backend smoke service, so it is useful for checking database and MinIO wiring quickly.

## Recovery Notes

- If `/settings` shows Redis down, continue the demo; Redis is supporting infrastructure, not the core resume optimization path.
- If RAG indexing fails because embeddings are unavailable, disable RAG on `/upload` and continue with keyword evidence scoring plus rewrite.
- If model calls fail, the backend safe fallback should still produce structured analysis/rewrite output for the demo path.
