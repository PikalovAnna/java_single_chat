package org.pikalovanna.java_single_chat.entity;

import lombok.Getter;
import lombok.Setter;

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
    String text;

    @OneToOne
    @JoinColumn(name = "author")
    User author;
}
