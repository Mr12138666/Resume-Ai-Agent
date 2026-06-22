package com.resumeai.agent;

import com.resumeai.application.analysis.KeywordMatcher;
import com.resumeai.application.knowledge.RagKnowledgeService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class ResumeOptimizationTools {

    private final RagKnowledgeService ragKnowledgeService;
    private final KeywordMatcher keywordMatcher;

    public ResumeOptimizationTools(RagKnowledgeService ragKnowledgeService, KeywordMatcher keywordMatcher) {
        this.ragKnowledgeService = ragKnowledgeService;
        this.keywordMatcher = keywordMatcher;
    }

    @Tool(description = "从 RAG 知识库检索简历优化建议。")
    public String retrieveGuidance(@ToolParam(description = "根据目标岗位和简历缺口构造的检索问题。") String query) {
        var results = ragKnowledgeService.search(query, 4);
        if (results.isEmpty()) {
            return "暂未检索到可用建议。";
        }
        return String.join("\n\n", results.stream()
                .map(result -> result.title() + ": " + result.content())
                .toList());
    }

    @Tool(description = "计算简历文本与目标岗位 JD 之间透明的关键词匹配分。")
    public String calculateMatchScore(
            @ToolParam(description = "简历文本") String resumeText,
            @ToolParam(description = "目标岗位 JD") String jobDescription
    ) {
        var match = keywordMatcher.match(resumeText, jobDescription);
        var total = Math.max(1, match.keywords().size());
        var score = Math.round(match.matched().size() * 100f / total);
        return "keywordScore=%d, matched=%s, missing=%s".formatted(score, match.matched(), match.missing());
    }
}
