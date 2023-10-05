package org.pikalovanna.java_single_chat.dto;

import lombok.Getter;
import lombok.Setter;
import org.pikalovanna.java_single_chat.entity.ChatMessage;

@Getter
@Setter
public class ChatMessageWrapper {

    private MessageType type;
    private String content;
    private String sender;

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE
    }

    public ChatMessageWrapper(){}

    public ChatMessageWrapper(ChatMessage chatMessage){
        this.type = chatMessage.getType();
        this.content = chatMessage.getContent();
        this.sender = chatMessage.getSender();
    }

}
