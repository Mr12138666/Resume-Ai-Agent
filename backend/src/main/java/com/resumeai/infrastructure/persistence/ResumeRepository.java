package com.resumeai.infrastructure.persistence;

import com.resumeai.domain.resume.Resume;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeRepository extends JpaRepository<Resume, UUID> {
}
