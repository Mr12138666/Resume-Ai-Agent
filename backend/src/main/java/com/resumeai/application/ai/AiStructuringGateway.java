package com.resumeai.application.ai;

public interface AiStructuringGateway {

    StructuredResume structureResume(String rawText);

    StructuredJob structureJob(String description);
}
