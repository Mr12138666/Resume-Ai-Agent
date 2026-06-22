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
                            你是一名中文简历改写智能体。
                            你可以调用工具检索 RAG 建议并计算关键词匹配分。
                            只允许改写用户提供的简历文本。
                            必须保留所有事实，不得编造雇主、指标、日期、职责或技术栈。
                            输出要简洁、专业，并围绕目标岗位优化表达。
                            """)
                    .user("""
                            原始简历文本：
                            %s

                            目标岗位 JD：
                            %s

                            请先使用 RAG 建议和匹配评分工具，再给出最终改写。
                            返回 rewrittenText 和 rationale，内容使用中文。
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

                优化提示：请在不新增事实的前提下，更明确地写出与目标岗位相关的工具、职责范围和已有成果。
                """.formatted(originalText.strip());
        return new RewriteGeneration(
                rewritten.strip(),
                "模型调用失败，已使用兜底改写逻辑。参考到的检索建议：" + guidance
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
        return rawText;
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
                # 优化后的简历段落

                ## 目标岗位

                - 岗位：%s
                - 公司：%s

                ## 改写后文本

                %s

                ## 改写理由

                %s

                ## 原始文本

                %s

                ## 事实校验

                ```json
                %s
                ```

                ## 追踪信息

                - 简历：%s
                - 分析 ID：%s
                - 改写 ID：%s
                """.formatted(
                blank(job.getTitle(), "未命名岗位"),
                blank(job.getCompany(), "未知公司"),
                blank(draft.getRewrittenText(), ""),
                blank(draft.getRationale(), ""),
                blank(draft.getOriginalText(), ""),
                blank(draft.getVerificationJson(), "{}"),
                blank(resume.getTitle(), "未命名简历"),
                analysis.getId(),
                draft.getId()
        ).strip() + "\n";
    }

    private String blank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.strip();
    }
}
