package com.resumeai.domain.resume;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "resumes")
public class Resume {

    @Id
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "original_filename", length = 500)
    private String originalFilename;

    @Column(name = "content_type", length = 120)
    private String contentType;

    @Column(name = "object_key", length = 700)
    private String objectKey;

    @Column(name = "raw_text")
    private String rawText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structured_json", columnDefinition = "jsonb")
    private String structuredJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ResumeStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Resume() {
    }

    public Resume(String title, String originalFilename, String contentType, String objectKey, String rawText) {
        this.id = UUID.randomUUID();
        this.title = title;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.objectKey = objectKey;
        this.rawText = rawText;
        this.status = rawText == null || rawText.isBlank() ? ResumeStatus.UPLOADED : ResumeStatus.PARSED;
    }

    public void markStructured(String structuredJson) {
        this.structuredJson = structuredJson;
        this.status = ResumeStatus.STRUCTURED;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public String getContentType() {
        return contentType;
    }

    public String getObjectKey() {
        return objectKey;
    }

    public String getRawText() {
        return rawText;
    }

    public String getStructuredJson() {
        return structuredJson;
    }

    public ResumeStatus getStatus() {
        return status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
