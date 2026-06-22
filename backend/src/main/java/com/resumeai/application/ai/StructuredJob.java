package com.resumeai.application.ai;

import java.util.List;

public record StructuredJob(
        String title,
        String seniority,
        List<String> requiredSkills,
        List<String> preferredSkills,
        List<String> responsibilities,
        List<String> keywords
) {
}
