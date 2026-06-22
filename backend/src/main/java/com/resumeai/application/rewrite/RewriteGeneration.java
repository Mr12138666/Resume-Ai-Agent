package com.resumeai.application.rewrite;

public record RewriteGeneration(
        String rewrittenText,
        String rationale,
        String verificationJson
) {
}
