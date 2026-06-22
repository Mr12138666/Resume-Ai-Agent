package com.resumeai.application.demo;

import com.resumeai.application.rewrite.ExportRewriteResponse;
import java.util.UUID;

public record DemoSmokeResponse(
        UUID resumeId,
        UUID jobId,
        UUID analysisId,
        UUID rewriteId,
        ExportRewriteResponse export
) {
}
