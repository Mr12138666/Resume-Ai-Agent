package com.resumeai.application.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeai.application.analysis.AnalysisReport;
import com.resumeai.application.rewrite.ResumeRewriteService;
import com.resumeai.domain.analysis.Analysis;
import com.resumeai.domain.job.JobDescription;
import com.resumeai.domain.resume.Resume;
import com.resumeai.domain.rewrite.RewriteDraft;
import com.resumeai.infrastructure.persistence.AnalysisRepository;
import com.resumeai.infrastructure.persistence.JobDescriptionRepository;
import com.resumeai.infrastructure.persistence.ResumeRepository;
import com.resumeai.infrastructure.persistence.RewriteDraftRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DemoSmokeService {

    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final AnalysisRepository analysisRepository;
    private final RewriteDraftRepository rewriteDraftRepository;
    private final ResumeRewriteService resumeRewriteService;
    private final ObjectMapper objectMapper;

    public DemoSmokeService(
            ResumeRepository resumeRepository,
            JobDescriptionRepository jobDescriptionRepository,
            AnalysisRepository analysisRepository,
            RewriteDraftRepository rewriteDraftRepository,
            ResumeRewriteService resumeRewriteService,
            ObjectMapper objectMapper
    ) {
        this.resumeRepository = resumeRepository;
        this.jobDescriptionRepository = jobDescriptionRepository;
        this.analysisRepository = analysisRepository;
        this.rewriteDraftRepository = rewriteDraftRepository;
        this.resumeRewriteService = resumeRewriteService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public DemoSmokeResponse createSmokeRun() {
        var resume = resumeRepository.save(new Resume(
                "Demo Java Backend Resume",
                "demo-java-backend-resume.txt",
                "text/plain",
                "demo/resumes/demo-java-backend-resume.txt",
                demoResumeText()
        ));
        var job = jobDescriptionRepository.save(new JobDescription(
                "Senior Java Backend Engineer",
                "Demo Cloud",
                demoJobDescription()
        ));
        var analysis = analysisRepository.save(new Analysis(
                resume,
                job,
                84,
                82,
                86,
                83,
                writeReportJson()
        ));
        var rewrite = rewriteDraftRepository.save(new RewriteDraft(
                analysis,
                "demo-experience",
                originalBullet(),
                rewrittenBullet(),
                "Reframed the project with stronger action verbs, explicit Spring Boot/PostgreSQL evidence, measurable latency impact, and ATS-aligned backend keywords while preserving the original facts.",
                "{\"faithfulness\":\"passed_demo_review\",\"inventedFactsAllowed\":false}"
        ));
        var export = resumeRewriteService.exportMarkdown(rewrite.getId());
        return new DemoSmokeResponse(resume.getId(), job.getId(), analysis.getId(), rewrite.getId(), export);
    }

    private String writeReportJson() {
        try {
            var report = new AnalysisReport(
                    List.of("java", "spring boot", "postgresql", "redis", "docker", "rag", "observability"),
                    List.of("java", "spring boot", "postgresql", "redis", "docker"),
                    List.of("kubernetes", "distributed tracing"),
                    List.of(
                            "Add a short backend-focused summary that mirrors the role's Spring Boot and cloud requirements.",
                            "Quantify project impact near each backend technology keyword.",
                            "Mention observability and deployment context where truthful evidence exists."
                    ),
                    List.of("ATS guidance: use exact role keywords only when backed by resume evidence."),
                    List.of(
                            new AnalysisReport.EvidenceItem("spring boot", "Built Spring Boot REST services for resume parsing and analysis.", true),
                            new AnalysisReport.EvidenceItem("postgresql", "Stored analysis and rewrite records in PostgreSQL.", true),
                            new AnalysisReport.EvidenceItem("kubernetes", "", false)
                    )
            );
            return objectMapper.writeValueAsString(report);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to create demo report JSON.", exception);
        }
    }

    private String demoResumeText() {
        return """
                Java backend engineer with experience building Spring Boot APIs, PostgreSQL persistence, Redis caching, Docker deployments, and document parsing workflows.

                Project: Resume AI Agent
                - Built REST APIs for resume upload, JD matching, and rewrite draft generation.
                - Integrated PostgreSQL, MinIO, and Redis health checks for a deployable demo workflow.
                - Reduced manual resume tailoring effort by generating structured suggestions and rewrite drafts.
                """;
    }

    private String demoJobDescription() {
        return """
                We are hiring a Senior Java Backend Engineer to build Spring Boot services for AI-enabled document workflows.
                Requirements include Java 21, REST API design, PostgreSQL, Redis, Docker, observability, and experience integrating LLM or RAG systems.
                Bonus: Kubernetes, distributed tracing, and strong product ownership.
                """;
    }

    private String originalBullet() {
        return "Built APIs for resume upload and matching with PostgreSQL and Redis.";
    }

    private String rewrittenBullet() {
        return "Built Spring Boot APIs for resume upload, JD matching, and rewrite workflows, using PostgreSQL for traceable analysis records and Redis-backed health checks to support a reliable AI resume optimization demo.";
    }
}
