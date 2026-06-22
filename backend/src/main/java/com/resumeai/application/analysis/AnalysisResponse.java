package com.resumeai.application.analysis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeai.domain.analysis.Analysis;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AnalysisResponse(
        UUID id,
        UUID resumeId,
        UUID jobId,
        int overallScore,
        int keywordScore,
        int semanticScore,
        int atsScore,
        String status,
        AnalysisReport report,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static AnalysisResponse from(Analysis analysis, ObjectMapper objectMapper) {
        return new AnalysisResponse(
                analysis.getId(),
                analysis.getResume().getId(),
                analysis.getJob().getId(),
                analysis.getOverallScore(),
                analysis.getKeywordScore(),
                analysis.getSemanticScore(),
                analysis.getAtsScore(),
                analysis.getStatus().name(),
                readReport(analysis.getReportJson(), objectMapper),
                analysis.getCreatedAt(),
                analysis.getUpdatedAt()
        );
    }

    private static AnalysisReport readReport(String json, ObjectMapper objectMapper) {
        try {
            return objectMapper.readValue(json, AnalysisReport.class);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to read analysis report.", exception);
        }
    }
}
