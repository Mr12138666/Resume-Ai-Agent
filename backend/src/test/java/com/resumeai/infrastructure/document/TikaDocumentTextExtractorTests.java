package com.resumeai.infrastructure.document;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class TikaDocumentTextExtractorTests {

    private final TikaDocumentTextExtractor extractor = new TikaDocumentTextExtractor();

    @Test
    void extractsPlainTextResume() {
        var text = """
                Jay Zhang

                Java Backend Engineer
                Spring AI, PostgreSQL, PGvector
                """;

        var extracted = extractor.extract(
                new ByteArrayInputStream(text.getBytes(StandardCharsets.UTF_8)),
                "resume.txt",
                "text/plain"
        );

        assertThat(extracted)
                .contains("Jay Zhang")
                .contains("Java Backend Engineer")
                .contains("PGvector");
    }
}
