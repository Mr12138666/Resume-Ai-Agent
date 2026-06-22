package com.resumeai.interfaces.analysis;

import com.resumeai.application.analysis.AnalysisApplicationService;
import com.resumeai.application.analysis.AnalysisResponse;
import com.resumeai.application.analysis.CreateAnalysisRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analyses")
public class AnalysisController {

    private final AnalysisApplicationService analysisApplicationService;

    public AnalysisController(AnalysisApplicationService analysisApplicationService) {
        this.analysisApplicationService = analysisApplicationService;
    }

    @PostMapping
    public AnalysisResponse create(@Valid @RequestBody CreateAnalysisRequest request) {
        return analysisApplicationService.create(request);
    }

    @GetMapping
    public List<AnalysisResponse> list() {
        return analysisApplicationService.list();
    }

    @GetMapping("/{analysisId}")
    public AnalysisResponse get(@PathVariable UUID analysisId) {
        return analysisApplicationService.get(analysisId);
    }
}
