package com.resumeai.application.job;

import jakarta.validation.constraints.NotBlank;

public record CreateJobDescriptionRequest(
        String title,
        String company,
        @NotBlank String description
) {
}
