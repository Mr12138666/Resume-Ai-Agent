package com.resumeai.application.rewrite;

import jakarta.validation.constraints.NotBlank;

public record ApplyRewriteCandidateRequest(
        @NotBlank String rewrittenText
) {
}
