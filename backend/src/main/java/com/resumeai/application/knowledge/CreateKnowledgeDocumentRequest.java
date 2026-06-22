package com.resumeai.application.knowledge;

import jakarta.validation.constraints.NotBlank;

public record CreateKnowledgeDocumentRequest(
        @NotBlank String documentType,
        @NotBlank String title,
        String sourceType,
        @NotBlank String content
) {
}
