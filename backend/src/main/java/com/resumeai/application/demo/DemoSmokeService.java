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
                "演示 Java 后端简历",
                "demo-java-backend-resume.txt",
                "text/plain",
                "demo/resumes/demo-java-backend-resume.txt",
                demoResumeText()
        ));
        var job = jobDescriptionRepository.save(new JobDescription(
                "高级 Java 后端工程师",
                "演示云科技",
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
                "在保留原始事实的前提下，强化了动作词、Spring Boot/PostgreSQL 技术证据、可追踪记录价值和与后端岗位匹配的 ATS 关键词。",
                "{\"结论\":\"演示数据已通过基础校验\",\"是否发现新增事实\":\"未发现\",\"需要人工复核\":\"建议复核\",\"依据摘要\":\"改写内容中的 Spring Boot、PostgreSQL、Redis 均来自原始演示简历。\",\"复核建议\":\"正式使用时仍需核对项目名称、数字指标和职责边界。\"}"
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
                            "补充一段聚焦 Java 后端与 AI 文档平台的中文摘要。",
                            "在 Spring Boot、PostgreSQL、Redis 等关键词附近补充真实项目影响。",
                            "如果简历中有证据，可补充可观测性和部署上下文。"
                    ),
                    List.of("ATS 建议：只有在简历证据支持时，才使用 JD 中的精确关键词。"),
                    List.of(
                            new AnalysisReport.EvidenceItem("spring boot", "构建了用于简历解析和匹配分析的 Spring Boot REST 服务。", true),
                            new AnalysisReport.EvidenceItem("postgresql", "使用 PostgreSQL 保存分析与改写记录。", true),
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
                Java 后端工程师，具备 Spring Boot API、PostgreSQL 持久化、Redis 缓存、Docker 部署和文档解析工作流经验。

                项目：简历优化智能体
                - 构建简历上传、JD 匹配和改写草稿生成相关 REST API。
                - 集成 PostgreSQL、MinIO 和 Redis 健康检查，支撑可部署的演示流程。
                - 通过结构化建议和改写草稿降低手动定制简历的成本。
                """;
    }

    private String demoJobDescription() {
        return """
                我们正在招聘高级 Java 后端工程师，负责构建面向 AI 文档工作流的 Spring Boot 服务。
                岗位要求包括 Java 21、REST API 设计、PostgreSQL、Redis、Docker、可观测性，以及 LLM 或 RAG 系统集成经验。
                加分项：Kubernetes、分布式追踪和较强的产品 Owner 意识。
                """;
    }

    private String originalBullet() {
        return "构建简历上传和匹配相关 API，并使用 PostgreSQL 与 Redis。";
    }

    private String rewrittenBullet() {
        return "构建 Spring Boot API 支撑简历上传、JD 匹配和改写流程，使用 PostgreSQL 保存可追踪分析记录，并通过 Redis 健康检查提升 AI 简历优化演示链路的可靠性。";
    }
}
