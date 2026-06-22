package com.resumeai.infrastructure.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.servlet.autoconfigure.MultipartProperties;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class StartupConfigurationLogger implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupConfigurationLogger.class);

    private final Environment environment;
    private final MultipartProperties multipartProperties;
    private final ResumeAiProperties properties;

    public StartupConfigurationLogger(
            Environment environment,
            MultipartProperties multipartProperties,
            ResumeAiProperties properties
    ) {
        this.environment = environment;
        this.multipartProperties = multipartProperties;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info(
                "Resume AI 配置已加载：PostgreSQL={}, MinIO={}, Bucket={}, Redis={}:{}, ChatProvider={}, ChatModel={}, EmbeddingProvider={}, UploadMaxFile={}, UploadMaxRequest={}",
                maskDatabasePassword(environment.getProperty("spring.datasource.url", "未配置")),
                properties.storage().endpoint(),
                properties.storage().bucket(),
                properties.redis().host(),
                properties.redis().port(),
                environment.getProperty("spring.ai.model.chat", "unknown"),
                environment.getProperty("spring.ai.openai.chat.options.model",
                        environment.getProperty("spring.ai.ollama.chat.model", "unknown")),
                environment.getProperty("spring.ai.model.embedding", "unknown"),
                multipartProperties.getMaxFileSize(),
                multipartProperties.getMaxRequestSize()
        );
    }

    private String maskDatabasePassword(String url) {
        return url.replaceAll("(?i)(password=)[^&;]+", "$1****");
    }
}
