package com.resumeai.application.analysis;

import java.util.List;

public record AnalysisReport(
        List<String> extractedKeywords,
        List<String> matchedKeywords,
        List<String> missingKeywords,
        List<String> suggestions,
        List<String> retrievedGuidance,
        List<EvidenceItem> evidenceMap
) {
    public record EvidenceItem(
            String keyword,
            String evidence,
            boolean matched
    ) {
    }
}
