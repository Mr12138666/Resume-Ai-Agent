package com.resumeai.application.rewrite;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ExportRewriteResponse(
        UUID rewriteId,
        String format,
        String objectKey,
        String contentType,
        long size,
        OffsetDateTime exportedAt,
        String downloadUrl,
        OffsetDateTime downloadUrlExpiresAt
) {
}
