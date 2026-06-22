package com.resumeai.application.knowledge;

import com.resumeai.domain.knowledge.KnowledgeDocument;
import com.resumeai.infrastructure.persistence.KnowledgeDocumentRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KnowledgeDocumentApplicationService {

    private final KnowledgeDocumentRepository repository;
    private final RagKnowledgeService ragKnowledgeService;

    public KnowledgeDocumentApplicationService(KnowledgeDocumentRepository repository, RagKnowledgeService ragKnowledgeService) {
        this.repository = repository;
        this.ragKnowledgeService = ragKnowledgeService;
    }

    @Transactional
    public KnowledgeDocumentResponse create(CreateKnowledgeDocumentRequest request) {
        var document = new KnowledgeDocument(
                request.documentType().trim(),
                request.title().trim(),
                blankToNull(request.sourceType()),
                null,
                request.content().trim(),
                "{}"
        );
        return KnowledgeDocumentResponse.from(repository.save(document));
    }

    @Transactional(readOnly = true)
    public List<KnowledgeDocumentResponse> list() {
        return repository.findAll().stream()
                .map(KnowledgeDocumentResponse::from)
                .toList();
    }

    @Transactional
    public KnowledgeDocumentResponse index(UUID documentId) {
        var document = repository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Knowledge document not found: " + documentId));
        ragKnowledgeService.index(document);
        document.markIndexed();
        return KnowledgeDocumentResponse.from(document);
    }

    @Transactional(readOnly = true)
    public List<KnowledgeSearchResult> search(KnowledgeSearchRequest request) {
        return ragKnowledgeService.search(request.query(), request.topK() == null ? 5 : request.topK());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
