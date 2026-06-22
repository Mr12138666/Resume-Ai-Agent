package com.resumeai.application.rewrite;

import com.resumeai.agent.ResumeOptimizationTools;
import com.resumeai.domain.analysis.Analysis;
import com.resumeai.domain.rewrite.RewriteDraft;
import com.resumeai.infrastructure.persistence.AnalysisRepository;
import com.resumeai.infrastructure.persistence.RewriteDraftRepository;
import com.resumeai.infrastructure.storage.ObjectStorageService;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResumeRewriteService {

    private static final Logger log = LoggerFactory.getLogger(ResumeRewriteService.class);
    private static final Duration EXPORT_DOWNLOAD_URL_EXPIRY = Duration.ofHours(1);

    private final AnalysisRepository analysisRepository;
    private final RewriteDraftRepository rewriteDraftRepository;
    private final ResumeOptimizationTools tools;
    private final ChatClient.Builder chatClientBuilder;
    private final ObjectStorageService objectStorageService;

    public ResumeRewriteService(
            AnalysisRepository analysisRepository,
            RewriteDraftRepository rewriteDraftRepository,
            ResumeOptimizationTools tools,
            ChatClient.Builder chatClientBuilder,
            ObjectStorageService objectStorageService
    ) {
        this.analysisRepository = analysisRepository;
        this.rewriteDraftRepository = rewriteDraftRepository;
        this.tools = tools;
        this.chatClientBuilder = chatClientBuilder;
        this.objectStorageService = objectStorageService;
    }

    @Transactional
    public RewriteDraftResponse create(UUID analysisId, CreateRewriteRequest request) {
        var analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new IllegalArgumentException("Analysis not found: " + analysisId));
        var originalText = chooseOriginalText(analysis, request);
        var generated = generateRewrite(analysis, originalText);
        var draft = new RewriteDraft(
                analysis,
                request == null ? null : request.sectionId(),
                originalText,
                generated.rewrittenText(),
                generated.rationale(),
                "{\"faithfulness\":\"requires_user_review\",\"inventedFactsAllowed\":false}"
        );
        return RewriteDraftResponse.from(rewriteDraftRepository.save(draft));
    }

    @Transactional(readOnly = true)
    public List<RewriteDraftResponse> list() {
        return rewriteDraftRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(RewriteDraftResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RewriteDraftResponse get(UUID rewriteId) {
        return rewriteDraftRepository.findById(rewriteId)
                .map(RewriteDraftResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Rewrite draft not found: " + rewriteId));
    }

    @Transactional(readOnly = true)
    public ExportRewriteResponse exportMarkdown(UUID rewriteId) {
        var draft = rewriteDraftRepository.findById(rewriteId)
                .orElseThrow(() -> new IllegalArgumentException("Rewrite draft not found: " + rewriteId));
        var markdown = buildMarkdown(draft);
        var bytes = markdown.getBytes(StandardCharsets.UTF_8);
        var objectKey = "exports/rewrites/%s/optimized-section.md".formatted(rewriteId);
        objectStorageService.put(
                objectKey,
                new ByteArrayInputStream(bytes),
                bytes.length,
                "text/markdown; charset=utf-8"
        );
        var exportedAt = OffsetDateTime.now();
        var expiresAt = exportedAt.plus(EXPORT_DOWNLOAD_URL_EXPIRY);
        var downloadUrl = objectStorageService.presignedGetUrl(objectKey, EXPORT_DOWNLOAD_URL_EXPIRY);
        return new ExportRewriteResponse(
                rewriteId,
                "markdown",
                objectKey,
                "text/markdown; charset=utf-8",
                bytes.length,
                exportedAt,
                downloadUrl,
                expiresAt
        );
    }

    private RewriteGeneration generateRewrite(Analysis analysis, String originalText) {
        try {
            return chatClientBuilder.build()
                    .prompt()
                    .system("""
                            You are a resume rewrite agent.
                            You may call tools to retrieve guidance and calculate match score.
                            Rewrite only the provided resume text.
                            Preserve all facts. Do not invent employers, metrics, dates, responsibilities, or technologies.
                            Return concise professional wording optimized for the target job.
                            """)
                    .user("""
                            Original resume text:
                            %s

                            Target job description:
                            %s

                            Use RAG guidance and match scoring tools before finalizing.
                            Return rewrittenText and rationale.
                            """.formatted(limit(originalText), limit(analysis.getJob().getDescription())))
                    .tools(tools)
                    .call()
                    .entity(RewriteGeneration.class);
        } catch (Exception exception) {
            log.warn("LLM rewrite failed; using fallback rewrite: {}", exception.getMessage());
            return fallbackRewrite(analysis, originalText);
        }
    }

    private RewriteGeneration fallbackRewrite(Analysis analysis, String originalText) {
        var guidance = tools.retrieveGuidance(analysis.getJob().getDescription());
        var rewritten = """
                %s

                Optimization note: Align this section more explicitly with the target role by naming relevant tools, scope, and outcomes already supported by your experience.
                """.formatted(originalText.strip());
        return new RewriteGeneration(
                rewritten.strip(),
                "Fallback rewrite used because the model call failed. Guidance considered: " + guidance
        );
    }

    private String chooseOriginalText(Analysis analysis, CreateRewriteRequest request) {
        if (request != null && request.sectionText() != null && !request.sectionText().isBlank()) {
            return request.sectionText().trim();
        }
        var rawText = analysis.getResume().getRawText();
        if (rawText == null || rawText.isBlank()) {
            return "";
        }
        return rawText.length() <= 1600 ? rawText : rawText.substring(0, 1600);
    }

    private String limit(String text) {
        if (text == null) {
            return "";
        }
        return text.length() <= 8_000 ? text : text.substring(0, 8_000);
    }

    private String buildMarkdown(RewriteDraft draft) {
        var analysis = draft.getAnalysis();
        var resume = analysis.getResume();
        var job = analysis.getJob();
        return """
                # Optimized Resume Section

                ## Target Role

                - Title: %s
                - Company: %s

                ## Rewritten Text

                %s

                ## Rationale

                %s

                ## Original Text

                %s

                ## Verification

                ```json
                %s
                ```

                ## Trace

                - Resume: %s
                - Analysis ID: %s
                - Rewrite ID: %s
                """.formatted(
                blank(job.getTitle(), "Untitled role"),
                blank(job.getCompany(), "Unknown company"),
                blank(draft.getRewrittenText(), ""),
                blank(draft.getRationale(), ""),
                blank(draft.getOriginalText(), ""),
                blank(draft.getVerificationJson(), "{}"),
                blank(resume.getTitle(), "Untitled resume"),
                analysis.getId(),
                draft.getId()
        ).strip() + "\n";
    }

    private String blank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.strip();
    }
}
