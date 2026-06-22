package com.resumeai.application.analysis;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateAnalysisRequest(
        @NotNull UUID resumeId,
        @NotNull UUID jobId,
        AnalysisOptions options
) {
    public record AnalysisOptions(
            Boolean useRag,
            Boolean includeAtsScore,
            String language
    ) {
    }
}
