package com.resumeai.application.analysis;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class KeywordMatcher {

    private static final Pattern ENGLISH_TOKEN = Pattern.compile("[A-Za-z][A-Za-z0-9+#.\\-]{2,}");

    private static final Set<String> TECH_TERMS = Set.of(
            "java", "spring", "spring boot", "spring ai", "mysql", "postgresql", "pgvector",
            "redis", "minio", "docker", "kubernetes", "rag", "llm", "agent", "tool calling",
            "openai", "ollama", "react", "next.js", "typescript", "python", "fastapi",
            "microservices", "rest", "sse", "websocket", "jpa", "hibernate", "flyway",
            "简历", "岗位", "后端", "前端", "全栈", "智能体", "大模型", "向量", "检索",
            "提示词", "文档解析", "匹配", "优化", "部署"
    );

    private static final Set<String> STOP_WORDS = Set.of(
            "and", "the", "for", "with", "you", "your", "our", "are", "this", "that",
            "will", "have", "has", "from", "job", "role", "work", "team", "using",
            "experience", "skills", "responsibilities", "requirements", "ability"
    );

    public List<String> extractKeywords(String jobDescription) {
        var normalized = normalize(jobDescription);
        var keywords = new LinkedHashSet<String>();

        for (var term : TECH_TERMS) {
            if (normalized.contains(term)) {
                keywords.add(term);
            }
        }

        var matcher = ENGLISH_TOKEN.matcher(normalized);
        while (matcher.find()) {
            var token = matcher.group();
            if (!STOP_WORDS.contains(token) && token.length() >= 3) {
                keywords.add(token);
            }
        }

        return keywords.stream()
                .sorted(Comparator.comparingInt(String::length).reversed().thenComparing(String::compareTo))
                .limit(30)
                .toList();
    }

    public MatchResult match(String resumeText, String jobDescription) {
        var resume = normalize(resumeText);
        var keywords = extractKeywords(jobDescription);
        var matched = new ArrayList<String>();
        var missing = new ArrayList<String>();
        var evidence = new ArrayList<AnalysisReport.EvidenceItem>();

        for (var keyword : keywords) {
            if (resume.contains(keyword)) {
                matched.add(keyword);
                evidence.add(new AnalysisReport.EvidenceItem(keyword, findEvidence(resumeText, keyword), true));
            } else {
                missing.add(keyword);
                evidence.add(new AnalysisReport.EvidenceItem(keyword, "", false));
            }
        }

        return new MatchResult(keywords, matched, missing, evidence);
    }

    private String findEvidence(String resumeText, String keyword) {
        var normalizedKeyword = keyword.toLowerCase(Locale.ROOT);
        var lines = resumeText.split("\\R");
        for (var line : lines) {
            if (line.toLowerCase(Locale.ROOT).contains(normalizedKeyword)) {
                return line.trim();
            }
        }
        return keyword;
    }

    private String normalize(String text) {
        return text == null ? "" : text.toLowerCase(Locale.ROOT).replaceAll("\\s+", " ").trim();
    }

    public record MatchResult(
            List<String> keywords,
            List<String> matched,
            List<String> missing,
            List<AnalysisReport.EvidenceItem> evidence
    ) {
    }
}
