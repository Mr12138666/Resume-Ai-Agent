package com.resumeai.application.job;

import com.resumeai.domain.job.JobDescription;
import java.time.OffsetDateTime;
import java.util.UUID;

public record JobDescriptionResponse(
        UUID id,
        String title,
        String company,
        String description,
        String status,
        String structuredJson,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static JobDescriptionResponse from(JobDescription job) {
        return new JobDescriptionResponse(
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getDescription(),
                job.getStatus().name(),
                job.getStructuredJson(),
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }
}
