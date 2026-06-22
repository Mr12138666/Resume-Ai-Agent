package com.resumeai.application.resume;

import org.springframework.web.multipart.MultipartFile;

public record ResumeUploadCommand(
        MultipartFile file,
        String title
) {
}
