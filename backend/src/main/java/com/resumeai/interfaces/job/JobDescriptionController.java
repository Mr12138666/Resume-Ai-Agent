package com.resumeai.interfaces.job;

import com.resumeai.application.job.CreateJobDescriptionRequest;
import com.resumeai.application.job.JobDescriptionApplicationService;
import com.resumeai.application.job.JobDescriptionResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobDescriptionController {

    private final JobDescriptionApplicationService jobDescriptionApplicationService;

    public JobDescriptionController(JobDescriptionApplicationService jobDescriptionApplicationService) {
        this.jobDescriptionApplicationService = jobDescriptionApplicationService;
    }

    @PostMapping
    public JobDescriptionResponse create(@Valid @RequestBody CreateJobDescriptionRequest request) {
        return jobDescriptionApplicationService.create(request);
    }

    @GetMapping
    public List<JobDescriptionResponse> list() {
        return jobDescriptionApplicationService.list();
    }

    @GetMapping("/{jobId}")
    public JobDescriptionResponse get(@PathVariable UUID jobId) {
        return jobDescriptionApplicationService.get(jobId);
    }

    @PostMapping("/{jobId}/structure")
    public JobDescriptionResponse structure(@PathVariable UUID jobId) {
        return jobDescriptionApplicationService.structure(jobId);
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> delete(@PathVariable UUID jobId) {
        jobDescriptionApplicationService.delete(jobId);
        return ResponseEntity.noContent().build();
    }
}
