package com.resumeai.application.rewrite;

import com.resumeai.domain.rewrite.RewriteDraft;
import java.time.OffsetDateTime;
import java.util.UUID;

public record RewriteDraftResponse(
        UUID id,
        UUID analysisId,
        String sectionId,
        String originalText,
        String rewrittenText,
        String rationale,
        String verificationJson,
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static RewriteDraftResponse from(RewriteDraft draft) {
        return new RewriteDraftResponse(
                draft.getId(),
                draft.getAnalysis().getId(),
                draft.getSectionId(),
                draft.getOriginalText(),
                draft.getRewrittenText(),
                draft.getRationale(),
                draft.getVerificationJson(),
                draft.getStatus().name(),
                draft.getCreatedAt(),
                draft.getUpdatedAt()
        );
    }
}
