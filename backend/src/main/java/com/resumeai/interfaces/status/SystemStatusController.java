package com.resumeai.interfaces.status;

import com.resumeai.application.status.SystemStatusResponse;
import com.resumeai.application.status.SystemStatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/status")
public class SystemStatusController {

    private final SystemStatusService systemStatusService;

    public SystemStatusController(SystemStatusService systemStatusService) {
        this.systemStatusService = systemStatusService;
    }

    @GetMapping
    public SystemStatusResponse getStatus() {
        return systemStatusService.getStatus();
    }
}
