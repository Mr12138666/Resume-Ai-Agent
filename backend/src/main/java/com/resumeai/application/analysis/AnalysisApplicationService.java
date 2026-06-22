package com.resumeai.application.analysis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeai.application.knowledge.RagKnowledgeService;
import com.resumeai.domain.analysis.Analysis;
import com.resumeai.infrastructure.persistence.AnalysisRepository;
import com.resumeai.infrastructure.persistence.JobDescriptionRepository;
import com.resumeai.infrastructure.persistence.ResumeRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalysisApplicationService {

    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final AnalysisRepository analysisRepository;
    private final KeywordMatcher keywordMatcher;
    private final RagKnowledgeService ragKnowledgeService;
    private final ObjectMapper objectMapper;

    public AnalysisApplicationService(
            ResumeRepository resumeRepository,
            JobDescriptionRepository jobDescriptionRepository,
            AnalysisRepository analysisRepository,
            KeywordMatcher keywordMatcher,
            RagKnowledgeService ragKnowledgeService,
            ObjectMapper objectMapper
    ) {
        this.resumeRepository = resumeRepository;
        this.jobDescriptionRepository = jobDescriptionRepository;
        this.analysisRepository = analysisRepository;
        this.keywordMatcher = keywordMatcher;
        this.ragKnowledgeService = ragKnowledgeService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AnalysisResponse create(CreateAnalysisRequest request) {
        var resume = resumeRepository.findById(request.resumeId())
                .orElseThrow(() -> new IllegalArgumentException("Resume not found: " + request.resumeId()));
        var job = jobDescriptionRepository.findById(request.jobId())
                .orElseThrow(() -> new IllegalArgumentException("Job description not found: " + request.jobId()));

        var match = keywordMatcher.match(resume.getRawText(), job.getDescription());
        var keywordScore = score(match.matched().size(), match.keywords().size());
        var useRag = request.options() == null || !Boolean.FALSE.equals(request.options().useRag());
        var guidance = useRag
                ? ragKnowledgeService.search(job.getDescription(), 4).stream()
                        .map(result -> result.title() + ": " + result.content())
                        .toList()
                : List.<String>of();
        var semanticScore = Math.min(100, Math.round(keywordScore * 0.75f + coverageBonus(resume.getRawText())));
        var atsScore = Math.min(100, Math.round(keywordScore * 0.65f + 25));
        var overallScore = Math.round(keywordScore * 0.5f + semanticScore * 0.3f + atsScore * 0.2f);
        var report = new AnalysisReport(
                match.keywords(),
                match.matched(),
                match.missing(),
                suggestions(match.missing(), keywordScore, guidance),
                guidance,
                match.evidence()
        );

        var analysis = new Analysis(
                resume,
                job,
                overallScore,
                keywordScore,
                semanticScore,
                atsScore,
                writeJson(report)
        );

        return AnalysisResponse.from(analysisRepository.save(analysis), objectMapper);
    }

    @Transactional(readOnly = true)
    public List<AnalysisResponse> list() {
        return analysisRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(analysis -> AnalysisResponse.from(analysis, objectMapper))
                .toList();
    }

    @Transactional(readOnly = true)
    public AnalysisResponse get(UUID analysisId) {
        return analysisRepository.findById(analysisId)
                .map(analysis -> AnalysisResponse.from(analysis, objectMapper))
                .orElseThrow(() -> new IllegalArgumentException("Analysis not found: " + analysisId));
    }

    private int score(int matched, int total) {
        if (total == 0) {
            return 0;
        }
        return Math.round((matched * 100f) / total);
    }

    private int coverageBonus(String resumeText) {
        var length = resumeText == null ? 0 : resumeText.length();
        if (length > 2000) {
            return 20;
        }
        if (length > 1000) {
            return 15;
        }
        if (length > 500) {
            return 10;
        }
        return 5;
    }

    private List<String> suggestions(List<String> missingKeywords, int keywordScore, List<String> guidance) {
        var suggestions = new ArrayList<String>();
        if (keywordScore < 60) {
            suggestions.add("Add a targeted summary section that mirrors the role's core requirements.");
        }
        if (!missingKeywords.isEmpty()) {
            suggestions.add("Review these missing JD keywords and add truthful evidence where your experience supports them: "
                    + String.join(", ", missingKeywords.stream().limit(8).toList()));
        }
        suggestions.add("Rewrite project bullets with action verb + technical scope + measurable result.");
        suggestions.add("Keep every optimization faithful to existing experience; do not invent responsibilities or metrics.");
        if (!guidance.isEmpty()) {
            suggestions.add("Use retrieved resume guidance to improve relevance: " + guidance.getFirst());
        }
        return suggestions;
    }

    private String writeJson(AnalysisReport report) {
        try {
            return objectMapper.writeValueAsString(report);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to serialize analysis report.", exception);
        }
    }
}
