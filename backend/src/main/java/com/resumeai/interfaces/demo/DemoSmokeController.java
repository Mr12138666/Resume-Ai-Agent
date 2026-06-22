package com.resumeai.interfaces.demo;

import com.resumeai.application.demo.DemoSmokeResponse;
import com.resumeai.application.demo.DemoSmokeService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/demo")
public class DemoSmokeController {

    private final DemoSmokeService demoSmokeService;

    public DemoSmokeController(DemoSmokeService demoSmokeService) {
        this.demoSmokeService = demoSmokeService;
    }

    @PostMapping("/smoke")
    public DemoSmokeResponse createSmokeRun() {
        return demoSmokeService.createSmokeRun();
    }
}
