package com.resumeai.application.knowledge;

import jakarta.validation.constraints.NotBlank;

public record KnowledgeSearchRequest(
        @NotBlank String query,
        Integer topK
) {
}
