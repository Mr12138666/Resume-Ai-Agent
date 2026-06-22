package com.resumeai.domain.rewrite;

import com.resumeai.domain.analysis.Analysis;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "rewrite_drafts")
public class RewriteDraft {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analysis_id", nullable = false)
    private Analysis analysis;

    @Column(name = "section_id", length = 120)
    private String sectionId;

    @Column(name = "original_text")
    private String originalText;

    @Column(name = "rewritten_text")
    private String rewrittenText;

    @Column
    private String rationale;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "verification_json", columnDefinition = "jsonb")
    private String verificationJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RewriteDraftStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected RewriteDraft() {
    }

    public RewriteDraft(Analysis analysis, String sectionId, String originalText, String rewrittenText, String rationale, String verificationJson) {
        this.id = UUID.randomUUID();
        this.analysis = analysis;
        this.sectionId = sectionId;
        this.originalText = originalText;
        this.rewrittenText = rewrittenText;
        this.rationale = rationale;
        this.verificationJson = verificationJson;
        this.status = RewriteDraftStatus.DRAFT;
    }

    public UUID getId() {
        return id;
    }

    public Analysis getAnalysis() {
        return analysis;
    }

    public String getSectionId() {
        return sectionId;
    }

    public String getOriginalText() {
        return originalText;
    }

    public String getRewrittenText() {
        return rewrittenText;
    }

    public String getRationale() {
        return rationale;
    }

    public String getVerificationJson() {
        return verificationJson;
    }

    public RewriteDraftStatus getStatus() {
        return status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
