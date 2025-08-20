package org.pikalovanna.java_single_chat.repository;

import org.pikalovanna.java_single_chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT c FROM ChatMessage c WHERE c.sender = :sender AND c.type = 'CHAT' ORDER BY c.timestamp DESC")
    List<ChatMessage> findChatMessagesBySender(@Param("sender") String sender);
    
    Optional<ChatMessage> findByIdAndSender(Long id, String sender);
}
