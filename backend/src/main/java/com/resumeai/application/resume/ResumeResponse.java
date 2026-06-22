package com.resumeai.application.resume;

import com.resumeai.domain.resume.Resume;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ResumeResponse(
        UUID id,
        String title,
        String originalFilename,
        String contentType,
        String status,
        int rawTextLength,
        String rawText,
        String rawTextPreview,
        String structuredJson,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static ResumeResponse from(Resume resume) {
        var rawText = resume.getRawText() == null ? "" : resume.getRawText();
        return new ResumeResponse(
                resume.getId(),
                resume.getTitle(),
                resume.getOriginalFilename(),
                resume.getContentType(),
                resume.getStatus().name(),
                rawText.length(),
                rawText,
                preview(rawText),
                resume.getStructuredJson(),
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }

    private static String preview(String text) {
        if (text.length() <= 500) {
            return text;
        }
        return text.substring(0, 500);
    }
}
