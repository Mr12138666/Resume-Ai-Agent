package com.resumeai.application.rewrite;

import java.util.List;
import java.util.UUID;

public record RewriteCandidateResponse(
        UUID rewriteId,
        String userMessage,
        String rewrittenText,
        String rationale,
        String verificationJson,
        String originalText,
        String conversationHistory,
        int regeneratedCount,
        String status,
        List<String> suggestions
) {
}
