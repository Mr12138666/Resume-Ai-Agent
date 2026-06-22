package com.resumeai.infrastructure.persistence;

import com.resumeai.domain.analysis.Analysis;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalysisRepository extends JpaRepository<Analysis, UUID> {
}
