package com.resumeai.infrastructure.ai;

import com.resumeai.application.ai.AiStructuringGateway;
import com.resumeai.application.ai.StructuredJob;
import com.resumeai.application.ai.StructuredResume;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Primary
@Component
@ConditionalOnBean(ChatClient.Builder.class)
public class ChatClientAiStructuringGateway implements AiStructuringGateway {

    private static final Logger log = LoggerFactory.getLogger(ChatClientAiStructuringGateway.class);

    private final ChatClient chatClient;
    private final FallbackAiStructuringGateway fallback;

    public ChatClientAiStructuringGateway(ChatClient.Builder chatClientBuilder, FallbackAiStructuringGateway fallback) {
        this.chatClient = chatClientBuilder.build();
        this.fallback = fallback;
    }

    @Override
    public StructuredResume structureResume(String rawText) {
        try {
            return chatClient.prompt()
                    .system("""
                            You are a strict resume parser.
                            Extract facts from the resume into the requested Java record shape.
                            Do not invent employers, dates, metrics, education, skills, or projects.
                            Use empty strings or empty arrays when evidence is missing.
                            """)
                    .user("""
                            Resume text:
                            %s
                            """.formatted(limit(rawText)))
                    .call()
                    .entity(StructuredResume.class);
        } catch (Exception exception) {
            log.warn("LLM resume structuring failed; falling back to deterministic parser: {}", exception.getMessage());
            return fallback.structureResume(rawText);
        }
    }

    @Override
    public StructuredJob structureJob(String description) {
        try {
            return chatClient.prompt()
                    .system("""
                            You are a strict job description parser.
                            Extract required skills, preferred skills, responsibilities, keywords, title, and seniority.
                            Do not add requirements that are not implied by the JD.
                            Use empty strings or empty arrays when evidence is missing.
                            """)
                    .user("""
                            Job description:
                            %s
                            """.formatted(limit(description)))
                    .call()
                    .entity(StructuredJob.class);
        } catch (Exception exception) {
            log.warn("LLM job structuring failed; falling back to deterministic parser: {}", exception.getMessage());
            return fallback.structureJob(description);
        }
    }

    private String limit(String text) {
        if (text == null) {
            return "";
        }
        return text.length() <= 12_000 ? text : text.substring(0, 12_000);
    }
}
