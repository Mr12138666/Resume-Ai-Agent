package com.resumeai.interfaces.knowledge;

import com.resumeai.application.knowledge.CreateKnowledgeDocumentRequest;
import com.resumeai.application.knowledge.KnowledgeDocumentApplicationService;
import com.resumeai.application.knowledge.KnowledgeDocumentResponse;
import com.resumeai.application.knowledge.KnowledgeSearchRequest;
import com.resumeai.application.knowledge.KnowledgeSearchResult;
import com.resumeai.application.knowledge.UpdateKnowledgeDocumentRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/knowledge")
public class KnowledgeDocumentController {

    private final KnowledgeDocumentApplicationService service;

    public KnowledgeDocumentController(KnowledgeDocumentApplicationService service) {
        this.service = service;
    }

    @PostMapping("/documents")
    public KnowledgeDocumentResponse create(@Valid @RequestBody CreateKnowledgeDocumentRequest request) {
        return service.create(request);
    }

    @GetMapping("/documents")
    public List<KnowledgeDocumentResponse> list() {
        return service.list();
    }

    @PostMapping("/documents/{documentId}/index")
    public KnowledgeDocumentResponse index(@PathVariable UUID documentId) {
        return service.index(documentId);
    }

    @PutMapping("/documents/{documentId}")
    public KnowledgeDocumentResponse update(
            @PathVariable UUID documentId,
            @Valid @RequestBody UpdateKnowledgeDocumentRequest request
    ) {
        return service.update(documentId, request);
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<Void> delete(@PathVariable UUID documentId) {
        service.delete(documentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/search")
    public List<KnowledgeSearchResult> search(@Valid @RequestBody KnowledgeSearchRequest request) {
        return service.search(request);
    }
}
