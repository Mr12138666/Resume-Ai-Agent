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
                            你是一名严格的简历解析器。
                            请把简历中的事实抽取到目标 Java record 结构中。
                            不要编造雇主、日期、指标、学历、技能或项目。
                            缺少证据时使用空字符串或空数组。
                            输出内容应以中文为主，技术名词可保留英文。
                            """)
                    .user("""
                            简历文本：
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
                            你是一名严格的岗位 JD 解析器。
                            请抽取必备技能、加分技能、职责、关键词、岗位名称和职级。
                            不要添加 JD 中没有明示或暗示的要求。
                            缺少证据时使用空字符串或空数组。
                            输出内容应以中文为主，技术名词可保留英文。
                            """)
                    .user("""
                            岗位 JD：
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
