package com.resumeai.application.knowledge;

import com.resumeai.domain.knowledge.KnowledgeDocument;
import com.resumeai.infrastructure.persistence.KnowledgeDocumentRepository;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class RagKnowledgeService {

    private static final Logger log = LoggerFactory.getLogger(RagKnowledgeService.class);
    private static final int MAX_CHUNK_LENGTH = 1800;
    private static final int CHUNK_OVERLAP_LENGTH = 180;

    private final VectorStore vectorStore;
    private final KnowledgeDocumentRepository repository;
    private final JdbcTemplate jdbcTemplate;

    public RagKnowledgeService(VectorStore vectorStore, KnowledgeDocumentRepository repository, JdbcTemplate jdbcTemplate) {
        this.vectorStore = vectorStore;
        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public void index(KnowledgeDocument document) {
        var chunks = splitIntoChunks(document.getContent());
        var vectorDocuments = new ArrayList<Document>();
        for (int index = 0; index < chunks.size(); index++) {
            vectorDocuments.add(Document.builder()
                    .id(chunkId(document, index))
                    .text(chunks.get(index))
                    .metadata(Map.of(
                            "knowledgeDocumentId", document.getId().toString(),
                            "title", document.getTitle(),
                            "documentType", document.getDocumentType(),
                            "sourceType", document.getSourceType() == null ? "" : document.getSourceType(),
                            "chunkIndex", index + 1,
                            "chunkCount", chunks.size()
                    ))
                    .build());
        }
        vectorStore.add(vectorDocuments);
    }

    public void deleteIndex(KnowledgeDocument document) {
        jdbcTemplate.update("DELETE FROM vector_store WHERE metadata ->> 'knowledgeDocumentId' = ?", document.getId().toString());
    }

    public List<KnowledgeSearchResult> search(String query, int topK) {
        try {
            var request = SearchRequest.builder()
                    .query(query)
                    .topK(Math.max(1, Math.min(topK, 10)))
                    .similarityThresholdAll()
                    .build();
            var results = vectorStore.similaritySearch(request);
            if (results != null && !results.isEmpty()) {
                return results.stream()
                        .map(document -> new KnowledgeSearchResult(
                                document.getId(),
                                String.valueOf(document.getMetadata().getOrDefault("title", "")),
                                document.getText(),
                                document.getScore(),
                                document.getMetadata()
                        ))
                        .toList();
            }
        } catch (Exception exception) {
            log.warn("Vector search failed; falling back to text search: {}", exception.getMessage());
        }

        return repository.findTop20ByContentContainingIgnoreCaseOrTitleContainingIgnoreCase(query, query).stream()
                .limit(Math.max(1, Math.min(topK, 10)))
                .map(document -> new KnowledgeSearchResult(
                        document.getId().toString(),
                        document.getTitle(),
                        document.getContent(),
                        null,
                        Map.of(
                                "documentType", document.getDocumentType(),
                                "sourceType", document.getSourceType() == null ? "" : document.getSourceType()
                        )
                ))
                .toList();
    }

    private List<String> splitIntoChunks(String content) {
        var normalizedContent = content == null ? "" : content.strip();
        if (normalizedContent.isBlank()) {
            throw new IllegalArgumentException("知识文档内容不能为空，无法索引。");
        }

        var chunks = new ArrayList<String>();
        var paragraphs = normalizedContent.split("\\R{2,}");
        var current = new StringBuilder();

        for (String paragraph : paragraphs) {
            var cleanedParagraph = paragraph.strip();
            if (cleanedParagraph.isBlank()) {
                continue;
            }

            if (cleanedParagraph.length() > MAX_CHUNK_LENGTH) {
                flushChunk(chunks, current);
                splitLongParagraph(cleanedParagraph, chunks);
                continue;
            }

            var separatorLength = current.isEmpty() ? 0 : 2;
            if (current.length() + separatorLength + cleanedParagraph.length() > MAX_CHUNK_LENGTH) {
                flushChunk(chunks, current);
            }

            if (!current.isEmpty()) {
                current.append("\n\n");
            }
            current.append(cleanedParagraph);
        }

        flushChunk(chunks, current);
        return chunks;
    }

    private void splitLongParagraph(String paragraph, List<String> chunks) {
        var start = 0;
        while (start < paragraph.length()) {
            var end = Math.min(paragraph.length(), start + MAX_CHUNK_LENGTH);
            chunks.add(paragraph.substring(start, end).strip());
            if (end == paragraph.length()) {
                break;
            }
            start = Math.max(end - CHUNK_OVERLAP_LENGTH, start + 1);
        }
    }

    private void flushChunk(List<String> chunks, StringBuilder current) {
        if (!current.isEmpty()) {
            chunks.add(current.toString().strip());
            current.setLength(0);
        }
    }

    private String chunkId(KnowledgeDocument document, int index) {
        var source = "%s:%d".formatted(document.getId(), index + 1);
        return UUID.nameUUIDFromBytes(source.getBytes(StandardCharsets.UTF_8)).toString();
    }
}
