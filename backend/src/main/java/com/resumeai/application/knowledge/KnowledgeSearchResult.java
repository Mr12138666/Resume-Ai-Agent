package com.resumeai.application.knowledge;

import java.util.Map;

public record KnowledgeSearchResult(
        String id,
        String title,
        String content,
        Double score,
        Map<String, Object> metadata
) {
}
