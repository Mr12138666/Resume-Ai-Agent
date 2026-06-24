package com.resumeai.application.rewrite;

public record CreateRewriteRequest(
        String sectionText,
        String sectionId,
        String customPrompt
) {
}
