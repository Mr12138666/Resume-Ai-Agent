package com.resumeai.application.status;

import com.resumeai.infrastructure.config.ResumeAiProperties;
import com.resumeai.infrastructure.redis.RedisHealthService;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SystemStatusService {

    private final ResumeAiProperties properties;
    private final RedisHealthService redisHealthService;

    public SystemStatusService(ResumeAiProperties properties, RedisHealthService redisHealthService) {
        this.properties = properties;
        this.redisHealthService = redisHealthService;
    }

    public SystemStatusResponse getStatus() {
        var components = List.of(
                new ComponentStatus("database", "CONFIGURED", "PostgreSQL is configured via spring.datasource."),
                new ComponentStatus("vector-store", "CONFIGURED", "PGvector target dimension: " + properties.rag().embeddingDimensions()),
                new ComponentStatus("object-storage", "CONFIGURED", "MinIO bucket: " + properties.storage().bucket()),
                redisHealthService.getStatus(),
                new ComponentStatus("llm", "CONFIGURED", "Provider mode: " + properties.llm().provider()),
                new ComponentStatus("agent-tools", "PLANNED", "Tool calling contracts are defined for parser, retriever, scorer, rewriter, and exporter.")
        );

        return new SystemStatusResponse("UP", Instant.now(), components);
    }
}
