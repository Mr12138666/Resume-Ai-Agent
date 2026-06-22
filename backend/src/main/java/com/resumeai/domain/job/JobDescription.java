package com.resumeai.domain.job;

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
@Table(name = "job_descriptions")
public class JobDescription {

    @Id
    private UUID id;

    @Column(length = 200)
    private String title;

    @Column(length = 200)
    private String company;

    @Column(nullable = false)
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structured_json", columnDefinition = "jsonb")
    private String structuredJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private JobDescriptionStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected JobDescription() {
    }

    public JobDescription(String title, String company, String description) {
        this.id = UUID.randomUUID();
        this.title = title;
        this.company = company;
        this.description = description;
        this.status = JobDescriptionStatus.CREATED;
    }

    public void markStructured(String structuredJson) {
        this.structuredJson = structuredJson;
        this.status = JobDescriptionStatus.STRUCTURED;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getCompany() {
        return company;
    }

    public String getDescription() {
        return description;
    }

    public String getStructuredJson() {
        return structuredJson;
    }

    public JobDescriptionStatus getStatus() {
        return status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
