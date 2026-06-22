package com.resumeai.application.knowledge;

import com.resumeai.domain.knowledge.KnowledgeDocument;
import com.resumeai.infrastructure.persistence.KnowledgeDocumentRepository;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class RagKnowledgeService {

    private static final Logger log = LoggerFactory.getLogger(RagKnowledgeService.class);

    private final VectorStore vectorStore;
    private final KnowledgeDocumentRepository repository;

    public RagKnowledgeService(VectorStore vectorStore, KnowledgeDocumentRepository repository) {
        this.vectorStore = vectorStore;
        this.repository = repository;
    }

    public void index(KnowledgeDocument document) {
        var vectorDocument = Document.builder()
                .id(document.getId().toString())
                .text(document.getContent())
                .metadata(Map.of(
                        "knowledgeDocumentId", document.getId().toString(),
                        "title", document.getTitle(),
                        "documentType", document.getDocumentType(),
                        "sourceType", document.getSourceType() == null ? "" : document.getSourceType()
                ))
                .build();
        vectorStore.add(List.of(vectorDocument));
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
}
