package com.resumeai.interfaces.rewrite;

import com.resumeai.application.rewrite.CreateRewriteRequest;
import com.resumeai.application.rewrite.ExportRewriteResponse;
import com.resumeai.application.rewrite.ResumeRewriteService;
import com.resumeai.application.rewrite.RewriteDraftResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    @PostMapping("/rewrites/{rewriteId}/exports/markdown")
    public ExportRewriteResponse exportMarkdown(@PathVariable UUID rewriteId) {
        return resumeRewriteService.exportMarkdown(rewriteId);
    }
}
