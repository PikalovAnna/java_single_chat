package org.pikalovanna.java_single_chat.entity;

import lombok.Getter;
import lombok.Setter;
import org.pikalovanna.java_single_chat.dto.ChatMessageWrapper;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Access(AccessType.PROPERTY)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Long id;

    @Column(name = "text")
    String content;

    @Column(name = "author")
    String sender;

    @Column
    @Enumerated(EnumType.STRING)
    ChatMessageWrapper.MessageType type;
}
