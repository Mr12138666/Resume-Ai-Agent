package com.resumeai.interfaces.resume;

import com.resumeai.application.resume.ResumeApplicationService;
import com.resumeai.application.resume.ResumeResponse;
import com.resumeai.application.resume.ResumeUploadCommand;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private final ResumeApplicationService resumeApplicationService;

    public ResumeController(ResumeApplicationService resumeApplicationService) {
        this.resumeApplicationService = resumeApplicationService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResumeResponse upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "title", required = false) String title
    ) {
        return resumeApplicationService.upload(new ResumeUploadCommand(file, title));
    }

    @GetMapping
    public List<ResumeResponse> list() {
        return resumeApplicationService.list();
    }

    @GetMapping("/{resumeId}")
    public ResumeResponse get(@PathVariable UUID resumeId) {
        return resumeApplicationService.get(resumeId);
    }

    @PostMapping("/{resumeId}/structure")
    public ResumeResponse structure(@PathVariable UUID resumeId) {
        return resumeApplicationService.structure(resumeId);
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> delete(@PathVariable UUID resumeId) {
        resumeApplicationService.delete(resumeId);
        return ResponseEntity.noContent().build();
    }
}
