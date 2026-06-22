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
                new ComponentStatus("database", "CONFIGURED", "PostgreSQL 已通过 spring.datasource 配置。"),
                new ComponentStatus("vector-store", "CONFIGURED", "PGvector 目标向量维度：" + properties.rag().embeddingDimensions()),
                new ComponentStatus("object-storage", "CONFIGURED", "MinIO Bucket：" + properties.storage().bucket()),
                redisHealthService.getStatus(),
                new ComponentStatus("llm", "CONFIGURED", "模型提供方：" + properties.llm().provider()),
                new ComponentStatus("agent-tools", "CONFIGURED", "已定义解析、检索、评分、改写和导出相关工具调用。")
        );

        return new SystemStatusResponse("UP", Instant.now(), components);
    }
}
