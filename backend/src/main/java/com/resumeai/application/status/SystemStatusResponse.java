package com.resumeai.application.status;

import java.time.Instant;
import java.util.List;

public record SystemStatusResponse(
        String status,
        Instant timestamp,
        List<ComponentStatus> components
) {
}
