package com.resumeai.application.rewrite;

import com.resumeai.agent.ResumeOptimizationTools;
import com.resumeai.domain.analysis.Analysis;
import com.resumeai.domain.rewrite.RewriteDraft;
import com.resumeai.infrastructure.persistence.AnalysisRepository;
import com.resumeai.infrastructure.persistence.RewriteDraftRepository;
import com.resumeai.infrastructure.storage.ObjectStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
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
    private final ObjectMapper objectMapper;

    public ResumeRewriteService(
            AnalysisRepository analysisRepository,
            RewriteDraftRepository rewriteDraftRepository,
            ResumeOptimizationTools tools,
            ChatClient.Builder chatClientBuilder,
            ObjectStorageService objectStorageService,
            ObjectMapper objectMapper
    ) {
        this.analysisRepository = analysisRepository;
        this.rewriteDraftRepository = rewriteDraftRepository;
        this.tools = tools;
        this.chatClientBuilder = chatClientBuilder;
        this.objectStorageService = objectStorageService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RewriteDraftResponse create(UUID analysisId, CreateRewriteRequest request) {
        var analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new IllegalArgumentException("Analysis not found: " + analysisId));
        var originalText = chooseOriginalText(analysis, request);
        var customPrompt = chooseCustomPrompt(request);
        var generated = generateRewrite(analysis, originalText, customPrompt);
        var draft = new RewriteDraft(
                analysis,
                request == null ? null : request.sectionId(),
                originalText,
                generated.rewrittenText(),
                generated.rationale(),
                verificationJson(generated, originalText)
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

    @Transactional
    public void delete(UUID rewriteId) {
        var draft = rewriteDraftRepository.findById(rewriteId)
                .orElseThrow(() -> new IllegalArgumentException("Rewrite draft not found: " + rewriteId));
        deleteExportIfExists("exports/rewrites/%s/optimized-section.md".formatted(rewriteId));
        deleteExportIfExists("exports/rewrites/%s/optimized-section.pdf".formatted(rewriteId));
        rewriteDraftRepository.delete(draft);
    }

    @Transactional
    public RewriteDraftResponse update(UUID rewriteId, UpdateRewriteRequest request) {
        var draft = rewriteDraftRepository.findById(rewriteId)
                .orElseThrow(() -> new IllegalArgumentException("Rewrite draft not found: " + rewriteId));
        draft.updateRewrittenText(request.rewrittenText().trim());
        return RewriteDraftResponse.from(rewriteDraftRepository.save(draft));
    }

    @Transactional
    public RewriteDraftResponse regenerate(UUID rewriteId, RegenerateRewriteRequest request) {
        var draft = rewriteDraftRepository.findById(rewriteId)
                .orElseThrow(() -> new IllegalArgumentException("Rewrite draft not found: " + rewriteId));
        var analysis = draft.getAnalysis();
        var originalText = draft.getOriginalText();
        var userMessage = request.userMessage();
        if (userMessage == null || userMessage.isBlank()) {
            userMessage = "请重新改写，提供更优版本。";
        }
        var generated = generateRewriteWithContext(analysis, originalText, draft, userMessage);
        draft.regenerate(generated.rewrittenText(), generated.rationale(), verificationJson(generated, originalText));
        draft.appendConversation(userMessage, generated.rationale());
        return RewriteDraftResponse.from(rewriteDraftRepository.save(draft));
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

    @Transactional(readOnly = true)
    public ExportRewriteResponse exportPdf(UUID rewriteId) {
        var draft = rewriteDraftRepository.findById(rewriteId)
                .orElseThrow(() -> new IllegalArgumentException("Rewrite draft not found: " + rewriteId));
        var pdfBytes = buildPdf(draft);
        var objectKey = "exports/rewrites/%s/optimized-section.pdf".formatted(rewriteId);
        objectStorageService.put(
                objectKey,
                new ByteArrayInputStream(pdfBytes),
                pdfBytes.length,
                "application/pdf"
        );
        var exportedAt = OffsetDateTime.now();
        var expiresAt = exportedAt.plus(EXPORT_DOWNLOAD_URL_EXPIRY);
        var downloadUrl = objectStorageService.presignedGetUrl(objectKey, EXPORT_DOWNLOAD_URL_EXPIRY);
        return new ExportRewriteResponse(
                rewriteId,
                "pdf",
                objectKey,
                "application/pdf",
                pdfBytes.length,
                exportedAt,
                downloadUrl,
                expiresAt
        );
    }

    private RewriteGeneration generateRewrite(Analysis analysis, String originalText, String customPrompt) {
        try {
            var systemBase = """
                    你是一名中文简历改写智能体。
                    你可以调用工具检索 RAG 建议并计算关键词匹配分。
                    只允许改写用户提供的简历文本。
                    必须保留所有事实，不得编造雇主、指标、日期、职责或技术栈。
                    输出要简洁、专业，并围绕目标岗位优化表达。
                    """;
            var systemFinal = (customPrompt == null || customPrompt.isBlank())
                    ? systemBase
                    : systemBase + "\n用户额外要求：\n" + customPrompt;
            return chatClientBuilder.build()
                    .prompt()
                    .system(systemFinal)
                    .user("""
                            原始简历文本：
                            %s

                            目标岗位 JD：
                            %s

                            请先使用 RAG 建议和匹配评分工具，再给出最终改写。
                            请返回 JSON 对象，字段包括：
                            - rewrittenText：改写后的中文简历文本。
                            - rationale：中文改写理由。
                            - verificationJson：字符串形式的 JSON，必须使用中文字段和值，包含：
                              结论、是否发现新增事实、需要人工复核、依据摘要、复核建议。
                            """.formatted(limit(originalText), limit(analysis.getJob().getDescription())))
                    .tools(tools)
                    .call()
                    .entity(RewriteGeneration.class);
        } catch (Exception exception) {
            log.warn("LLM rewrite failed; using fallback rewrite: {}", exception.getMessage());
            return fallbackRewrite(analysis, originalText);
        }
    }

    private void deleteExportIfExists(String objectKey) {
        try {
            objectStorageService.delete(objectKey);
        } catch (Exception exception) {
            log.warn("Failed to delete rewrite export {}: {}", objectKey, exception.getMessage());
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
                "模型调用失败，已使用兜底改写逻辑。参考到的检索建议：" + guidance,
                null
        );
    }

    private String verificationJson(RewriteGeneration generated, String originalText) {
        if (generated.verificationJson() != null && !generated.verificationJson().isBlank()) {
            return generated.verificationJson().trim();
        }
        return writeVerification(new VerificationResult(
                "待人工确认",
                "未发现明确新增事实",
                "需要",
                "系统要求模型仅基于原始简历改写；原始文本长度 %d 字。".formatted(originalText == null ? 0 : originalText.length()),
                "请重点核对数字指标、任职时间、公司名称、项目名称和技术栈是否都能在原始简历中找到依据。"
        ));
    }

    private String writeVerification(VerificationResult verification) {
        try {
            return objectMapper.writeValueAsString(verification);
        } catch (Exception exception) {
            return """
                    {"结论":"待人工确认","是否发现新增事实":"未发现明确新增事实","需要人工复核":"需要","依据摘要":"事实校验结果序列化失败。","复核建议":"请人工核对改写内容是否与原始简历一致。"}
                    """.strip();
        }
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

    private String chooseCustomPrompt(CreateRewriteRequest request) {
        if (request == null) {
            return null;
        }
        var prompt = request.customPrompt();
        return (prompt == null || prompt.isBlank()) ? null : prompt.strip();
    }

    private RewriteGeneration generateRewriteWithContext(Analysis analysis, String originalText, RewriteDraft draft, String userMessage) {
        try {
            var historyContext = new StringBuilder();
            var historyJson = draft.getConversationHistory();
            if (historyJson != null && !"[]".equals(historyJson)) {
                historyContext.append("\n此前对话历史：\n");
                try {
                    var arr = objectMapper.readTree(historyJson);
                    for (var i = 0; i < arr.size(); i++) {
                        var entry = arr.get(i);
                        var role = entry.get("role").asText();
                        var content = entry.get("content").asText();
                        historyContext.append("[").append(role).append("] ").append(content).append("\n");
                    }
                } catch (Exception ignored) {}
            }
            return chatClientBuilder.build()
                    .prompt()
                    .system("""
                            你是一名中文简历改写智能体。
                            你必须严格基于原始简历文本进行改写，不得编造事实。
                            用户在上次改写结果基础上提出了新的修改要求，请根据用户反馈重新改写。
                            如果用户对特定段落有明确要求，优先处理用户反馈。
                            """)
                    .user("""
                            原始简历文本：
                            %s

                            上一轮改写结果：
                            %s

                            目标岗位 JD：
                            %s

                            用户新要求：
                            %s
                            %s

                            请根据用户新要求重新改写。
                            请返回 JSON 对象，字段包括：
                            - rewrittenText：改写后的中文简历文本。
                            - rationale：中文改写理由，并说明如何回应用户的新要求。
                            - verificationJson：字符串形式的 JSON，必须使用中文字段和值，包含：
                              结论、是否发现新增事实、需要人工复核、依据摘要、复核建议。
                            """.formatted(
                            limit(originalText),
                            limit(draft.getRewrittenText()),
                            limit(analysis.getJob().getDescription()),
                            userMessage,
                            historyContext.toString()
                    ))
                    .tools(tools)
                    .call()
                    .entity(RewriteGeneration.class);
        } catch (Exception exception) {
            log.warn("LLM regenerate failed; keeping previous draft: {}", exception.getMessage());
            return new RewriteGeneration(draft.getRewrittenText(), draft.getRationale(), draft.getVerificationJson());
        }
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

    private byte[] buildPdf(RewriteDraft draft) {
        try (var document = new PDDocument(); var outputStream = new ByteArrayOutputStream()) {
            var font = loadChineseFont(document);
            var writer = new PdfTextWriter(document, font);
            writer.writeTitle("优化后的简历段落");
            writer.writeHeading("目标岗位");
            var analysis = draft.getAnalysis();
            var job = analysis.getJob();
            writer.writeParagraph("岗位：" + blank(job.getTitle(), "未命名岗位"));
            writer.writeParagraph("公司：" + blank(job.getCompany(), "未知公司"));
            writer.writeHeading("改写后文本");
            writer.writeMarkdown(blank(draft.getRewrittenText(), ""));
            writer.writeHeading("改写理由");
            writer.writeParagraph(blank(draft.getRationale(), ""));
            writer.writeHeading("事实校验");
            writer.writeParagraph(blank(draft.getVerificationJson(), "{}"));
            writer.close();
            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException("PDF 导出失败，请确认运行环境存在中文字体。", exception);
        }
    }

    private PDFont loadChineseFont(PDDocument document) throws Exception {
        var candidates = List.of(
                "C:/Windows/Fonts/simhei.ttf",
                "C:/Windows/Fonts/msyh.ttf",
                "C:/Windows/Fonts/msyhbd.ttf",
                "C:/Windows/Fonts/msyh.ttc",
                "C:/Windows/Fonts/msyhbd.ttc",
                "C:/Windows/Fonts/simsun.ttc",
                "C:/Windows/Fonts/simsun.ttf",
                "C:/Windows/Fonts/simkai.ttf",
                "C:/Windows/Fonts/yahei.ttf",
                "C:/Windows/Fonts/yaheib.ttf",
                "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
                "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
                "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"
        );
        for (var path : candidates) {
            var file = new File(path);
            if (!file.isFile()) {
                continue;
            }
            try {
                if (path.endsWith(".ttc")) {
                    return PDType0Font.load(document, file);
                }
                return PDType0Font.load(document, file);
            } catch (Exception ignored) {
                // 字体文件存在但加载失败，尝试下一个
            }
        }
        throw new IllegalStateException("未找到可用中文字体，无法生成中文 PDF。");
    }

    private String blank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.strip();
    }

    private record VerificationResult(
            String 结论,
            String 是否发现新增事实,
            String 需要人工复核,
            String 依据摘要,
            String 复核建议
    ) {
    }

    private static class PdfTextWriter {
        private static final float MARGIN = 54;
        private static final float FONT_SIZE = 10.5f;
        private static final float TITLE_SIZE = 18f;
        private static final float HEADING_SIZE = 13f;
        private static final float LINE_HEIGHT = 17f;

        private final PDDocument document;
        private final PDFont font;
        private PDPage page;
        private PDPageContentStream stream;
        private float y;

        PdfTextWriter(PDDocument document, PDFont font) throws Exception {
            this.document = document;
            this.font = font;
            newPage();
        }

        void writeTitle(String text) throws Exception {
            writeWrapped(text, TITLE_SIZE, 24f);
            y -= 8;
        }

        void writeHeading(String text) throws Exception {
            y -= 4;
            writeWrapped(text, HEADING_SIZE, 20f);
        }

        void writeParagraph(String text) throws Exception {
            for (var paragraph : blank(text).split("\\R", -1)) {
                writeWrapped(paragraph.isBlank() ? " " : paragraph, FONT_SIZE, LINE_HEIGHT);
            }
            y -= 6;
        }

        void writeMarkdown(String markdown) throws Exception {
            var lines = markdown.split("\\R", -1);
            var inCode = false;
            var codeBuf = new ArrayList<String>();

            for (var i = 0; i < lines.length; i++) {
                var raw = lines[i];

                // 代码块边界
                if (raw.trim().startsWith("```")) {
                    if (inCode) {
                        writeCodeBlock(String.join("\n", codeBuf));
                        codeBuf.clear();
                        inCode = false;
                    } else {
                        inCode = true;
                    }
                    continue;
                }
                if (inCode) {
                    codeBuf.add(raw);
                    continue;
                }

                // 空行
                if (raw.isBlank()) {
                    y -= 2;
                    continue;
                }

                var trimmed = raw.strip();

                // 标题 (长前缀优先匹配)
                if (trimmed.startsWith("### ")) {
                    y -= 2;
                    writeWrapped(stripInlineMarkdown(trimmed.substring(4)), HEADING_SIZE - 1, 18f);
                    y -= 2;
                    continue;
                }
                if (trimmed.startsWith("## ")) {
                    y -= 2;
                    writeWrapped(stripInlineMarkdown(trimmed.substring(3)), HEADING_SIZE, 20f);
                    y -= 2;
                    continue;
                }
                if (trimmed.startsWith("# ")) {
                    y -= 2;
                    writeWrapped(stripInlineMarkdown(trimmed.substring(2)), HEADING_SIZE + 2, 22f);
                    y -= 2;
                    continue;
                }

                // 分隔线
                if (trimmed.matches("^-{3,}$")) {
                    y -= 4;
                    continue;
                }

                // 引用
                if (trimmed.startsWith("> ")) {
                    writeWrapped("| " + stripInlineMarkdown(trimmed.substring(2)), FONT_SIZE, LINE_HEIGHT);
                    y -= 2;
                    continue;
                }

                // 无序列表（兼容 - 和 • 两种前缀）
                if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
                    writeWrapped("-  " + stripInlineMarkdown(trimmed.substring(2)), FONT_SIZE, LINE_HEIGHT);
                    y -= 2;
                    continue;
                }

                // 有序列表
                var ol = Pattern.compile("^(\\d+)\\. (.+)").matcher(trimmed);
                if (ol.matches()) {
                    writeWrapped(ol.group(1) + ".  " + stripInlineMarkdown(ol.group(2)), FONT_SIZE, LINE_HEIGHT);
                    y -= 2;
                    continue;
                }

                // 普通段落
                writeWrapped(stripInlineMarkdown(raw), FONT_SIZE, LINE_HEIGHT);
                y -= 6;
            }

            // 清理未闭合的代码块
            if (!codeBuf.isEmpty()) {
                writeCodeBlock(String.join("\n", codeBuf));
            }
        }

        void writeCodeBlock(String code) throws Exception {
            y -= 4;
            for (var line : code.split("\\R", -1)) {
                if (y < MARGIN) {
                    newPage();
                }
                writeWrapped("    " + line, FONT_SIZE - 1, LINE_HEIGHT - 2);
            }
            y -= 4;
        }

        static String stripInlineMarkdown(String text) {
            return sanitizeForPdf(text)
                    .replaceAll("\\*\\*(.+?)\\*\\*", "$1")
                    .replaceAll("\\*(.+?)\\*", "$1")
                    .replaceAll("`([^`]+)`", "$1")
                    .replaceAll("\\[([^\\]]+)\\]\\([^)]+\\)", "$1");
        }

        static String sanitizeForPdf(String text) {
            // 中文字体通常缺少的 Unicode 符号 → ASCII 安全字符
            return text
                    .replace("•", "-")
                    .replace("★", "*")
                    .replace("☆", "*")
                    .replace("✔", "[x]")
                    .replace("✓", "[x]")
                    .replace("✗", "[x]")
                    .replace("✘", "[x]")
                    .replace("→", "->")
                    .replace("←", "<-")
                    .replace("↑", "^")
                    .replace("↓", "v")
                    .replace("⇒", "=>")
                    .replace("⇐", "<=")
                    .replace("│", "|")
                    .replace("①", "1.")
                    .replace("②", "2.")
                    .replace("③", "3.")
                    .replace("④", "4.")
                    .replace("⑤", "5.")
                    .replace("⑥", "6.")
                    .replace("⑦", "7.")
                    .replace("⑧", "8.")
                    .replace("⑨", "9.")
                    .replace("⑩", "10.");
        }
        void close() throws Exception {
            if (stream != null) {
                stream.close();
            }
        }

        private void newPage() throws Exception {
            if (stream != null) {
                stream.close();
            }
            page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            stream = new PDPageContentStream(document, page);
            y = page.getMediaBox().getHeight() - MARGIN;
        }

        private void writeWrapped(String text, float fontSize, float lineHeight) throws Exception {
            for (var line : wrap(text, fontSize)) {
                if (y < MARGIN) {
                    newPage();
                }
                stream.beginText();
                stream.setFont(font, fontSize);
                stream.newLineAtOffset(MARGIN, y);
                stream.showText(line);
                stream.endText();
                y -= lineHeight;
            }
        }

        private List<String> wrap(String text, float fontSize) throws Exception {
            var maxWidth = page.getMediaBox().getWidth() - MARGIN * 2;
            var lines = new java.util.ArrayList<String>();
            var current = new StringBuilder();
            for (var token : text.split("(?<=\\s)|(?=\\s)|(?<=[\\u4e00-\\u9fff])|(?=[\\u4e00-\\u9fff])")) {
                if (token.isEmpty()) {
                    continue;
                }
                var candidate = current + token;
                if (!current.isEmpty() && textWidth(candidate, fontSize) > maxWidth) {
                    lines.add(current.toString());
                    current = new StringBuilder(token.stripLeading());
                } else {
                    current.append(token);
                }
            }
            lines.add(current.isEmpty() ? " " : current.toString());
            return lines;
        }

        private float textWidth(String text, float fontSize) throws Exception {
            return font.getStringWidth(text) / 1000f * fontSize;
        }

        private static String blank(String value) {
            return value == null || value.isBlank() ? " " : value.strip();
        }
    }
}
