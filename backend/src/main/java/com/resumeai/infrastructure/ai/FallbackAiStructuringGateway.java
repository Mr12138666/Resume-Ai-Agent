package com.resumeai.infrastructure.ai;

import com.resumeai.application.ai.AiStructuringGateway;
import com.resumeai.application.ai.StructuredJob;
import com.resumeai.application.ai.StructuredResume;
import com.resumeai.application.analysis.KeywordMatcher;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class FallbackAiStructuringGateway implements AiStructuringGateway {

    private final KeywordMatcher keywordMatcher;

    public FallbackAiStructuringGateway(KeywordMatcher keywordMatcher) {
        this.keywordMatcher = keywordMatcher;
    }

    @Override
    public StructuredResume structureResume(String rawText) {
        var lines = meaningfulLines(rawText);
        var candidateName = lines.isEmpty() ? null : lines.getFirst();
        var headline = lines.size() > 1 ? lines.get(1) : null;
        var skills = keywordMatcher.extractKeywords(rawText).stream().limit(20).toList();
        var highlights = lines.stream()
                .filter(line -> line.length() > 20)
                .limit(8)
                .toList();

        return new StructuredResume(
                candidateName,
                headline,
                "",
                skills,
                List.of(new StructuredResume.Experience("", "", "", highlights)),
                List.of(),
                lines.stream().limit(20).toList()
        );
    }

    @Override
    public StructuredJob structureJob(String description) {
        var keywords = keywordMatcher.extractKeywords(description);
        var lines = meaningfulLines(description);
        var responsibilities = lines.stream()
                .filter(line -> line.length() > 15)
                .limit(10)
                .toList();
        var requiredSkills = keywords.stream().limit(12).toList();
        var preferredSkills = keywords.stream().skip(12).limit(8).toList();

        return new StructuredJob(
                inferTitle(lines),
                inferSeniority(description),
                requiredSkills,
                preferredSkills,
                responsibilities,
                keywords
        );
    }

    private List<String> meaningfulLines(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }
        return Arrays.stream(text.split("\\R"))
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private String inferTitle(List<String> lines) {
        return lines.isEmpty() ? "" : lines.getFirst();
    }

    private String inferSeniority(String text) {
        var lower = text == null ? "" : text.toLowerCase();
        if (lower.contains("senior") || lower.contains("高级")) {
            return "senior";
        }
        if (lower.contains("junior") || lower.contains("初级")) {
            return "junior";
        }
        return "unspecified";
    }
}
