package com.resumeai.application.ai;

import java.util.List;

public record StructuredResume(
        String candidateName,
        String headline,
        String summary,
        List<String> skills,
        List<Experience> experiences,
        List<Education> education,
        List<String> rawSections
) {
    public record Experience(
            String title,
            String organization,
            String period,
            List<String> highlights
    ) {
    }

    public record Education(
            String school,
            String degree,
            String period
    ) {
    }
}
