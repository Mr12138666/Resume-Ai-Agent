package com.resumeai.infrastructure.redis;

import com.resumeai.application.status.ComponentStatus;
import com.resumeai.infrastructure.config.ResumeAiProperties;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisHealthService {

    private final ResumeAiProperties properties;
    private final StringRedisTemplate redisTemplate;

    public RedisHealthService(ResumeAiProperties properties, StringRedisTemplate redisTemplate) {
        this.properties = properties;
        this.redisTemplate = redisTemplate;
    }

    public ComponentStatus getStatus() {
        if (!properties.redis().enabled()) {
            return new ComponentStatus("redis", "DISABLED", "Redis 集成已禁用。");
        }

        try {
            var pong = redisTemplate.getConnectionFactory().getConnection().ping();
            return new ComponentStatus(
                    "redis",
                    "UP",
                    "来自 " + properties.redis().host() + ":" + properties.redis().port() + " 的 Ping 响应：" + pong
            );
        } catch (RedisConnectionFailureException exception) {
            return downStatus(exception);
        } catch (RuntimeException exception) {
            return downStatus(exception);
        }
    }

    private ComponentStatus downStatus(RuntimeException exception) {
        if (exception.getMessage() != null && exception.getMessage().contains("NOAUTH")) {
            return new ComponentStatus(
                    "redis",
                    "DOWN",
                    "Redis " + properties.redis().host() + ":" + properties.redis().port()
                            + " 需要认证，请在后端配置中设置 REDIS_PASSWORD。"
            );
        }

        return new ComponentStatus(
                "redis",
                "DOWN",
                "无法连接 Redis " + properties.redis().host() + ":" + properties.redis().port() + "：" + exception.getMessage()
        );
    }
}
