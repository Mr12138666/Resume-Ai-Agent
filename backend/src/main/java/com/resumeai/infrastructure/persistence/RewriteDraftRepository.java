package com.resumeai.infrastructure.persistence;

import com.resumeai.domain.rewrite.RewriteDraft;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewriteDraftRepository extends JpaRepository<RewriteDraft, UUID> {
}
