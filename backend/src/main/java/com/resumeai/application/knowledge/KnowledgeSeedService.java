package com.resumeai.application.knowledge;

import com.resumeai.domain.knowledge.KnowledgeDocument;
import com.resumeai.infrastructure.persistence.KnowledgeDocumentRepository;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class KnowledgeSeedService implements ApplicationRunner {

    private final KnowledgeDocumentRepository repository;

    public KnowledgeSeedService(KnowledgeDocumentRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seed("ATS 简历规则", "OPTIMIZATION_RULE", """
                适合 ATS 的简历应使用标准章节标题、明确技能名称、简单排版和与岗位相关的关键词。
                避免把核心内容放在表格或图片中，避免空泛摘要和没有证据支撑的能力描述。
                摘要、技能和最近项目经历应围绕目标 JD 做定向调整。
                """);
        seed("STAR 项目经历写法", "RESUME_GUIDE", """
                有说服力的简历项目经历通常遵循：动作 + 任务 + 技术范围 + 可验证结果。
                优先使用延迟下降、吞吐提升、成本节省、转化提升、可靠性改进或团队影响等证据。
                不要编造指标；如果没有指标，就写清具体范围和真实结果。
                """);
        seed("Java 后端岗位画像", "ROLE_GUIDE", """
                Java 后端岗位通常关注 Spring Boot、REST API、SQL、Redis、消息队列、Docker、可观测性、测试和分布式系统基础。
                好的简历会把这些技能连接到性能、可靠性、可维护性和业务流程等真实产出上。
                """);
        seed("AI Agent 岗位画像", "ROLE_GUIDE", """
                AI Agent 岗位通常关注 LLM 集成、提示词工程、RAG、向量数据库、工具调用、评估、可观测性和安全兜底。
                简历证据应尽量说明模型提供方、检索策略、文档解析、编排流程和可验证的产品影响。
                """);
    }

    private void seed(String title, String type, String content) {
        if (repository.findByTitle(title).isPresent()) {
            return;
        }
        repository.save(new KnowledgeDocument(type, title, "SEED", null, content.strip(), "{}"));
    }
}
