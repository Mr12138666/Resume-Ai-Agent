package com.resumeai.interfaces.rewrite;

import com.resumeai.application.rewrite.CreateRewriteRequest;
import com.resumeai.application.rewrite.ApplyRewriteCandidateRequest;
import com.resumeai.application.rewrite.ExportRewriteResponse;
import com.resumeai.application.rewrite.RegenerateRewriteRequest;
import com.resumeai.application.rewrite.RejectRewriteCandidateRequest;
import com.resumeai.application.rewrite.UpdateRewriteRequest;
import com.resumeai.application.rewrite.ResumeRewriteService;
import com.resumeai.application.rewrite.RewriteCandidateResponse;
import com.resumeai.application.rewrite.RewriteDraftResponse;

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
@RequestMapping("/api/v1")
public class RewriteController {

    private final ResumeRewriteService resumeRewriteService;

    public RewriteController(ResumeRewriteService resumeRewriteService) {
        this.resumeRewriteService = resumeRewriteService;
    }

    @PostMapping("/analyses/{analysisId}/rewrites")
    public RewriteDraftResponse create(@PathVariable UUID analysisId, @RequestBody(required = false) CreateRewriteRequest request) {
        return resumeRewriteService.create(analysisId, request);
    }

    @GetMapping("/rewrites")
    public List<RewriteDraftResponse> list() {
        return resumeRewriteService.list();
    }

    @GetMapping("/rewrites/{rewriteId}")
    public RewriteDraftResponse get(@PathVariable UUID rewriteId) {
        return resumeRewriteService.get(rewriteId);
    }

    @DeleteMapping("/rewrites/{rewriteId}")
    public ResponseEntity<Void> delete(@PathVariable UUID rewriteId) {
        resumeRewriteService.delete(rewriteId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/rewrites/{rewriteId}")
    public RewriteDraftResponse update(@PathVariable UUID rewriteId, @RequestBody UpdateRewriteRequest request) {
        return resumeRewriteService.update(rewriteId, request);
    }

    @PostMapping("/rewrites/{rewriteId}/regenerate")
    public RewriteCandidateResponse regenerate(@PathVariable UUID rewriteId, @RequestBody RegenerateRewriteRequest request) {
        return resumeRewriteService.regenerate(rewriteId, request);
    }

    @PostMapping("/rewrites/{rewriteId}/accept")
    public RewriteDraftResponse accept(@PathVariable UUID rewriteId, @RequestBody ApplyRewriteCandidateRequest request) {
        return resumeRewriteService.accept(rewriteId, request);
    }

    @PostMapping("/rewrites/{rewriteId}/reject")
    public RewriteDraftResponse reject(@PathVariable UUID rewriteId, @RequestBody(required = false) RejectRewriteCandidateRequest request) {
        return resumeRewriteService.reject(rewriteId, request);
    }

    @PostMapping("/rewrites/{rewriteId}/exports/markdown")
    public ExportRewriteResponse exportMarkdown(@PathVariable UUID rewriteId) {
        return resumeRewriteService.exportMarkdown(rewriteId);
    }

    @PostMapping("/rewrites/{rewriteId}/exports/pdf")
    public ExportRewriteResponse exportPdf(@PathVariable UUID rewriteId) {
        return resumeRewriteService.exportPdf(rewriteId);
    }
}
