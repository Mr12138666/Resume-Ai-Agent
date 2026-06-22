package com.resumeai.application.knowledge;

import com.resumeai.domain.knowledge.KnowledgeDocument;
import java.time.OffsetDateTime;
import java.util.UUID;

public record KnowledgeDocumentResponse(
        UUID id,
        String documentType,
        String title,
        String sourceType,
        String content,
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static KnowledgeDocumentResponse from(KnowledgeDocument document) {
        return new KnowledgeDocumentResponse(
                document.getId(),
                document.getDocumentType(),
                document.getTitle(),
                document.getSourceType(),
                document.getContent(),
                document.getStatus().name(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}
