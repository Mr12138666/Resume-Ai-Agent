package com.resumeai;

import com.resumeai.infrastructure.config.ResumeAiProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.data.redis.autoconfigure.DataRedisRepositoriesAutoConfiguration;

@SpringBootApplication(exclude = DataRedisRepositoriesAutoConfiguration.class)
@ConfigurationPropertiesScan(basePackageClasses = ResumeAiProperties.class)
public class ResumeAiAgentApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResumeAiAgentApplication.class, args);
    }
}
