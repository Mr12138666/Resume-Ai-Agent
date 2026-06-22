package com.resumeai.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "resume-ai")
public record ResumeAiProperties(
        Llm llm,
        Rag rag,
        Redis redis,
        Storage storage
) {
    public record Llm(
            String provider,
            String defaultChatModel,
            String defaultEmbeddingModel
    ) {
    }

    public record Rag(
            int embeddingDimensions,
            int topK,
            double similarityThreshold
    ) {
    }

    public record Redis(
            boolean enabled,
            String host,
            int port
    ) {
    }

    public record Storage(
            String bucket,
            String endpoint,
            String accessKey,
            String secretKey
    ) {
    }
}
