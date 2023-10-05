package org.pikalovanna.java_single_chat.controllers;

import lombok.RequiredArgsConstructor;
import org.pikalovanna.java_single_chat.dto.ChatMessageWrapper;
import org.pikalovanna.java_single_chat.service.ChatMessagesService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessagesService chatMessagesService;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessageWrapper sendMessage(@Payload ChatMessageWrapper chatMessage) {
        chatMessagesService.save(chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public List<ChatMessageWrapper> addUser(@Payload ChatMessageWrapper chatMessage,
                                            SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        chatMessagesService.save(chatMessage);
        return chatMessagesService.getPagedMessages(0,10).getContent();
    }
}
