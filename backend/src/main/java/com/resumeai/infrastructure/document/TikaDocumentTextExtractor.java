package com.resumeai.infrastructure.document;

import java.io.InputStream;
import org.apache.tika.Tika;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.xml.sax.ContentHandler;

@Service
public class TikaDocumentTextExtractor implements DocumentTextExtractor {

    private static final int WRITE_LIMIT = 2_000_000;

    private final AutoDetectParser parser = new AutoDetectParser();
    private final Tika tika = new Tika();

    @Override
    public String extract(InputStream inputStream, String filename, String contentType) {
        try {
            var metadata = new Metadata();
            metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, filename);
            if (contentType != null && !contentType.isBlank()) {
                metadata.set(Metadata.CONTENT_TYPE, contentType);
            }
            ContentHandler handler = new BodyContentHandler(WRITE_LIMIT);
            parser.parse(inputStream, handler, metadata);
            var text = handler.toString().trim();
            if (!text.isBlank()) {
                return normalize(text);
            }
        } catch (Exception ignored) {
            // Fallback below handles simple text files and edge cases.
        }

        try {
            return normalize(tika.parseToString(inputStream).trim());
        } catch (Exception exception) {
            throw new IllegalArgumentException("Failed to extract text from document: " + filename, exception);
        }
    }

    private String normalize(String text) {
        return text.replace("\r\n", "\n")
                .replace('\r', '\n')
                .replaceAll("[\\t ]+", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }
}
