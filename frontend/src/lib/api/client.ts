export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export type ResumeResponse = {
  id: string;
  title: string;
  originalFilename: string;
  contentType: string;
  status: string;
  rawTextLength: number;
  rawTextPreview: string;
  structuredJson: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JobDescriptionResponse = {
  id: string;
  title: string | null;
  company: string | null;
  description: string;
  status: string;
  structuredJson: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnalysisResponse = {
  id: string;
  resumeId: string;
  jobId: string;
  overallScore: number;
  keywordScore: number;
  semanticScore: number;
  atsScore: number;
  status: string;
  report: {
    extractedKeywords: string[];
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
    retrievedGuidance: string[];
    evidenceMap: Array<{
      keyword: string;
      evidence: string;
      matched: boolean;
    }>;
  };
  createdAt: string;
  updatedAt: string;
};

export type RewriteDraftResponse = {
  id: string;
  analysisId: string;
  sectionId: string | null;
  originalText: string;
  rewrittenText: string;
  rationale: string;
  verificationJson: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ExportRewriteResponse = {
  rewriteId: string;
  format: string;
  objectKey: string;
  contentType: string;
  size: number;
  exportedAt: string;
  downloadUrl: string;
  downloadUrlExpiresAt: string;
};

export type KnowledgeDocumentResponse = {
  id: string;
  documentType: string;
  title: string;
  sourceType: string | null;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeSearchResult = {
  id: string;
  title: string;
  content: string;
  score: number | null;
  metadata: Record<string, unknown>;
};

export type SystemStatusResponse = {
  status: string;
  timestamp: string;
  components: Array<{
    name: string;
    status: string;
    detail: string;
  }>;
};

export type DemoSmokeResponse = {
  resumeId: string;
  jobId: string;
  analysisId: string;
  rewriteId: string;
  export: ExportRewriteResponse;
};

export type SettingsResponse = {
  ai: {
    provider: string;
    springChatModel: string;
    springEmbeddingModel: string;
    openAiBaseUrl: string;
    openAiChatModel: string;
    openAiEmbeddingModel: string;
    openAiApiKeyConfigured: boolean;
    ollamaBaseUrl: string;
    ollamaChatModel: string;
    ollamaEmbeddingModel: string;
  };
  rag: {
    embeddingDimensions: number;
    topK: number;
    similarityThreshold: number;
  };
  storage: {
    endpoint: string;
    bucket: string;
    accessKeyConfigured: boolean;
    secretKeyConfigured: boolean;
  };
  redis: {
    enabled: boolean;
    host: string;
    port: number;
    passwordConfigured: boolean;
  };
};

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getSystemStatus(): Promise<SystemStatusResponse> {
  return apiGet<SystemStatusResponse>("/status");
}

export async function getSettings(): Promise<SettingsResponse> {
  return apiGet<SettingsResponse>("/settings");
}

export async function listResumes(): Promise<ResumeResponse[]> {
  return apiGet<ResumeResponse[]>("/resumes");
}

export async function listJobDescriptions(): Promise<JobDescriptionResponse[]> {
  return apiGet<JobDescriptionResponse[]>("/jobs");
}

export async function listAnalyses(): Promise<AnalysisResponse[]> {
  return apiGet<AnalysisResponse[]>("/analyses");
}

export async function listRewrites(): Promise<RewriteDraftResponse[]> {
  return apiGet<RewriteDraftResponse[]>("/rewrites");
}

export async function getResume(resumeId: string): Promise<ResumeResponse> {
  return apiGet<ResumeResponse>(`/resumes/${resumeId}`);
}

export async function getJobDescription(jobId: string): Promise<JobDescriptionResponse> {
  return apiGet<JobDescriptionResponse>(`/jobs/${jobId}`);
}

export async function getAnalysis(analysisId: string): Promise<AnalysisResponse> {
  return apiGet<AnalysisResponse>(`/analyses/${analysisId}`);
}

export async function getRewrite(rewriteId: string): Promise<RewriteDraftResponse> {
  return apiGet<RewriteDraftResponse>(`/rewrites/${rewriteId}`);
}

export async function exportRewriteMarkdown(rewriteId: string): Promise<ExportRewriteResponse> {
  const response = await fetch(`${API_BASE_URL}/rewrites/${rewriteId}/exports/markdown`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Rewrite export failed: ${response.status}`);
  }

  return response.json() as Promise<ExportRewriteResponse>;
}

export async function runDemoSmoke(): Promise<DemoSmokeResponse> {
  const response = await fetch(`${API_BASE_URL}/demo/smoke`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Demo smoke run failed: ${response.status}`);
  }

  return response.json() as Promise<DemoSmokeResponse>;
}

export async function uploadResume(file: File, title?: string): Promise<ResumeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (title?.trim()) {
    formData.append("title", title.trim());
  }

  const response = await fetch(`${API_BASE_URL}/resumes`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const fallback = `Resume upload failed: ${response.status}`;
    try {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? fallback);
    } catch (error) {
      if (error instanceof Error && error.message !== fallback) {
        throw error;
      }
      throw new Error(fallback);
    }
  }

  return response.json() as Promise<ResumeResponse>;
}

export async function createJobDescription(input: {
  title?: string;
  company?: string;
  description: string;
}): Promise<JobDescriptionResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Job description creation failed: ${response.status}`);
  }

  return response.json() as Promise<JobDescriptionResponse>;
}

export async function createAnalysis(input: {
  resumeId: string;
  jobId: string;
  useRag?: boolean;
}): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      resumeId: input.resumeId,
      jobId: input.jobId,
      options: {
        useRag: input.useRag ?? true,
        includeAtsScore: true,
        language: "en-US",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Analysis creation failed: ${response.status}`);
  }

  return response.json() as Promise<AnalysisResponse>;
}

export async function structureResume(resumeId: string): Promise<ResumeResponse> {
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/structure`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Resume structuring failed: ${response.status}`);
  }

  return response.json() as Promise<ResumeResponse>;
}

export async function structureJob(jobId: string): Promise<JobDescriptionResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/structure`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Job structuring failed: ${response.status}`);
  }

  return response.json() as Promise<JobDescriptionResponse>;
}

export async function createRewrite(input: {
  analysisId: string;
  sectionText?: string;
  sectionId?: string;
}): Promise<RewriteDraftResponse> {
  const response = await fetch(`${API_BASE_URL}/analyses/${input.analysisId}/rewrites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sectionText: input.sectionText,
      sectionId: input.sectionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Rewrite creation failed: ${response.status}`);
  }

  return response.json() as Promise<RewriteDraftResponse>;
}

export async function listKnowledgeDocuments(): Promise<KnowledgeDocumentResponse[]> {
  return apiGet<KnowledgeDocumentResponse[]>("/knowledge/documents");
}

export async function createKnowledgeDocument(input: {
  documentType: string;
  title: string;
  sourceType?: string;
  content: string;
}): Promise<KnowledgeDocumentResponse> {
  const response = await fetch(`${API_BASE_URL}/knowledge/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Knowledge document creation failed: ${response.status}`);
  }

  return response.json() as Promise<KnowledgeDocumentResponse>;
}

export async function indexKnowledgeDocument(documentId: string): Promise<KnowledgeDocumentResponse> {
  const response = await fetch(`${API_BASE_URL}/knowledge/documents/${documentId}/index`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Knowledge indexing failed: ${response.status}`);
  }

  return response.json() as Promise<KnowledgeDocumentResponse>;
}

export async function searchKnowledge(input: {
  query: string;
  topK?: number;
}): Promise<KnowledgeSearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/knowledge/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Knowledge search failed: ${response.status}`);
  }

  return response.json() as Promise<KnowledgeSearchResult[]>;
}
