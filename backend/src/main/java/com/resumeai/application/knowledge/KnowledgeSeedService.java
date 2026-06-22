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
        seed("ATS Resume Rules", "OPTIMIZATION_RULE", """
                ATS-friendly resumes should use standard section titles, explicit skill names, simple formatting, and role-relevant keywords.
                Avoid tables for core content, image-only resumes, vague summaries, and unsupported claims.
                Tailor the summary, skills, and recent project bullets to the target job description.
                """);
        seed("STAR Bullet Writing", "RESUME_GUIDE", """
                Strong resume bullets follow action + task + technical scope + measurable result.
                Prefer evidence such as latency reduction, throughput, cost savings, conversion lift, reliability improvement, or team impact.
                Do not invent metrics; if no metric exists, use concrete scope and outcome.
                """);
        seed("Java Backend Role Profile", "ROLE_GUIDE", """
                Java backend roles commonly expect Spring Boot, REST APIs, SQL, Redis, message queues, Docker, observability, testing, and distributed system fundamentals.
                Strong resumes connect these skills to production outcomes such as performance, reliability, maintainability, and business workflows.
                """);
        seed("AI Agent Role Profile", "ROLE_GUIDE", """
                AI agent roles value LLM integration, prompt engineering, RAG, vector databases, tool calling, evaluation, observability, and safe fallback behavior.
                Resume evidence should name model providers, retrieval strategy, document parsing, orchestration flow, and measurable product impact.
                """);
    }

    private void seed(String title, String type, String content) {
        if (repository.findByTitle(title).isPresent()) {
            return;
        }
        repository.save(new KnowledgeDocument(type, title, "SEED", null, content.strip(), "{}"));
    }
}
