package com.resumeai.infrastructure.persistence;

import com.resumeai.domain.knowledge.KnowledgeDocument;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, UUID> {

    Optional<KnowledgeDocument> findByTitle(String title);

    List<KnowledgeDocument> findTop20ByContentContainingIgnoreCaseOrTitleContainingIgnoreCase(String content, String title);
}
