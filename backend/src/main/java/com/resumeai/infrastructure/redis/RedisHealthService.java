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
            return new ComponentStatus("redis", "DISABLED", "Redis integration is disabled.");
        }

        try {
            var pong = redisTemplate.getConnectionFactory().getConnection().ping();
            return new ComponentStatus(
                    "redis",
                    "UP",
                    "Ping response from " + properties.redis().host() + ":" + properties.redis().port() + " = " + pong
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
                            + " requires authentication. Set REDIS_PASSWORD in the backend environment."
            );
        }

        return new ComponentStatus(
                "redis",
                "DOWN",
                "Redis " + properties.redis().host() + ":" + properties.redis().port() + " is not reachable: " + exception.getMessage()
        );
    }
}
