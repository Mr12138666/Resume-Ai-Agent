package com.resumeai.domain.knowledge;

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
@Table(name = "knowledge_documents")
public class KnowledgeDocument {

    @Id
    private UUID id;

    @Column(name = "document_type", nullable = false, length = 80)
    private String documentType;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(name = "source_type", length = 80)
    private String sourceType;

    @Column(name = "source_id")
    private UUID sourceId;

    @Column
    private String content;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata_json", columnDefinition = "jsonb")
    private String metadataJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private KnowledgeDocumentStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected KnowledgeDocument() {
    }

    public KnowledgeDocument(String documentType, String title, String sourceType, UUID sourceId, String content, String metadataJson) {
        this.id = UUID.randomUUID();
        this.documentType = documentType;
        this.title = title;
        this.sourceType = sourceType;
        this.sourceId = sourceId;
        this.content = content;
        this.metadataJson = metadataJson;
        this.status = KnowledgeDocumentStatus.CREATED;
    }

    public void markIndexed() {
        this.status = KnowledgeDocumentStatus.INDEXED;
    }

    public void markFailed() {
        this.status = KnowledgeDocumentStatus.FAILED;
    }

    public UUID getId() {
        return id;
    }

    public String getDocumentType() {
        return documentType;
    }

    public String getTitle() {
        return title;
    }

    public String getSourceType() {
        return sourceType;
    }

    public UUID getSourceId() {
        return sourceId;
    }

    public String getContent() {
        return content;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public KnowledgeDocumentStatus getStatus() {
        return status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
