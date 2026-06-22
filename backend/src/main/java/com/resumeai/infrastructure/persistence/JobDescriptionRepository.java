package com.resumeai.infrastructure.persistence;

import com.resumeai.domain.job.JobDescription;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobDescriptionRepository extends JpaRepository<JobDescription, UUID> {
}
