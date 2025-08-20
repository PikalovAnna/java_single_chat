package org.pikalovanna.java_single_chat.dto;

import lombok.Getter;
import lombok.Setter;
import org.pikalovanna.java_single_chat.entity.ChatMessage;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChatMessageWrapper {

    private Long id;
    private MessageType type;
    private String content;
    private String sender;
    private LocalDateTime timestamp;
    private Long originalMessageId; // For edit operations

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE,
        EDIT,
        DELETE
    }

    public ChatMessageWrapper(){}

    public ChatMessageWrapper(ChatMessage chatMessage){
        this.id = chatMessage.getId();
        this.type = chatMessage.getType();
        this.content = chatMessage.getContent();
        this.sender = chatMessage.getSender();
        this.timestamp = chatMessage.getTimestamp();
    }

}
