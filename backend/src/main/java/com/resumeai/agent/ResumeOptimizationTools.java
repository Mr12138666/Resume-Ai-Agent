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

    @Tool(description = "Retrieve resume optimization guidance from the RAG knowledge base.")
    public String retrieveGuidance(@ToolParam(description = "Search query built from the target job and resume gap.") String query) {
        var results = ragKnowledgeService.search(query, 4);
        if (results.isEmpty()) {
            return "No retrieved guidance available.";
        }
        return String.join("\n\n", results.stream()
                .map(result -> result.title() + ": " + result.content())
                .toList());
    }

    @Tool(description = "Calculate a transparent keyword match score between resume text and target job description.")
    public String calculateMatchScore(
            @ToolParam(description = "Resume text") String resumeText,
            @ToolParam(description = "Target job description") String jobDescription
    ) {
        var match = keywordMatcher.match(resumeText, jobDescription);
        var total = Math.max(1, match.keywords().size());
        var score = Math.round(match.matched().size() * 100f / total);
        return "keywordScore=%d, matched=%s, missing=%s".formatted(score, match.matched(), match.missing());
    }
}
