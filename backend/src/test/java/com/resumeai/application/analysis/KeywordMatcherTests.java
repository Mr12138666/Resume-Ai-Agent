package com.resumeai.application.analysis;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class KeywordMatcherTests {

    private final KeywordMatcher keywordMatcher = new KeywordMatcher();

    @Test
    void matchesResumeEvidenceAgainstJobDescriptionKeywords() {
        var resume = """
                Built Java Spring Boot services with PostgreSQL and Redis.
                Designed RAG workflow with PGvector and Ollama.
                """;
        var job = "We need Java, Spring Boot, PostgreSQL, PGvector, Docker, and RAG experience.";

        var result = keywordMatcher.match(resume, job);

        assertThat(result.keywords()).contains("java", "spring boot", "postgresql", "pgvector", "rag");
        assertThat(result.matched()).contains("java", "spring boot", "postgresql", "pgvector", "rag");
        assertThat(result.missing()).contains("docker");
        assertThat(result.evidence()).anyMatch(item -> item.keyword().equals("pgvector") && item.matched());
    }
}
