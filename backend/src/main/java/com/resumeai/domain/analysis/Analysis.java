package com.resumeai.domain.analysis;

import com.resumeai.domain.job.JobDescription;
import com.resumeai.domain.resume.Resume;
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
@Table(name = "analyses")
public class Analysis {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private JobDescription job;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "keyword_score")
    private Integer keywordScore;

    @Column(name = "semantic_score")
    private Integer semanticScore;

    @Column(name = "ats_score")
    private Integer atsScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "report_json", columnDefinition = "jsonb")
    private String reportJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AnalysisStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Analysis() {
    }

    public Analysis(
            Resume resume,
            JobDescription job,
            int overallScore,
            int keywordScore,
            int semanticScore,
            int atsScore,
            String reportJson
    ) {
        this.id = UUID.randomUUID();
        this.resume = resume;
        this.job = job;
        this.overallScore = overallScore;
        this.keywordScore = keywordScore;
        this.semanticScore = semanticScore;
        this.atsScore = atsScore;
        this.reportJson = reportJson;
        this.status = AnalysisStatus.COMPLETED;
    }

    public UUID getId() {
        return id;
    }

    public Resume getResume() {
        return resume;
    }

    public JobDescription getJob() {
        return job;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public Integer getKeywordScore() {
        return keywordScore;
    }

    public Integer getSemanticScore() {
        return semanticScore;
    }

    public Integer getAtsScore() {
        return atsScore;
    }

    public String getReportJson() {
        return reportJson;
    }

    public AnalysisStatus getStatus() {
        return status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
