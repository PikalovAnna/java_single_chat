package org.pikalovanna.java_single_chat.controllers;

import lombok.RequiredArgsConstructor;
import org.pikalovanna.java_single_chat.dto.ChatMessageWrapper;
import org.pikalovanna.java_single_chat.service.ChatMessagesService;
import org.pikalovanna.java_single_chat.service.UserService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessagesService chatMessagesService;
    private final UserService userService;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessageWrapper sendMessage(@Payload ChatMessageWrapper chatMessage) {
        return new ChatMessageWrapper(chatMessagesService.save(chatMessage));
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public Map<String, Object> addUser(@Payload ChatMessageWrapper chatMessage,
                                       SimpMessageHeaderAccessor headerAccessor) {
        String sender = chatMessage.getSender() == null ? null : chatMessage.getSender().trim();
        if (sender != null && !sender.isEmpty()) {
            headerAccessor.getSessionAttributes().put("username", sender);
            chatMessage.setSender(sender);
            chatMessagesService.save(chatMessage);
            userService.addUser(sender);
        }
        Map<String, Object> content = new HashMap<>();
        content.put("users", userService.getUsersOnline());
        content.put("messages", chatMessagesService.getPagedMessages(0, 10).getContent());
        return content;
    }

    @MessageMapping("/chat.editMessage")
    @SendTo("/topic/public")
    public ChatMessageWrapper editMessage(@Payload ChatMessageWrapper chatMessage) {
        if (chatMessage.getOriginalMessageId() != null && chatMessage.getContent() != null) {
            chatMessagesService.editMessage(chatMessage.getOriginalMessageId(),
                            chatMessage.getSender(),
                            chatMessage.getContent())
                    .ifPresent(editedMessage -> {
                        chatMessage.setId(editedMessage.getId());
                        chatMessage.setContent(editedMessage.getContent());
                        chatMessage.setTimestamp(editedMessage.getTimestamp());
                    });
        }
        return chatMessage;
    }

    @MessageMapping("/chat.deleteMessage")
    @SendTo("/topic/public")
    public ChatMessageWrapper deleteMessage(@Payload ChatMessageWrapper chatMessage) {
        if (chatMessage.getOriginalMessageId() != null) {
            chatMessagesService.deleteMessage(chatMessage.getOriginalMessageId(),
                            chatMessage.getSender())
                    .ifPresent(deletedMessage -> {
                        chatMessage.setId(deletedMessage.getId());
                        chatMessage.setContent(deletedMessage.getContent());
                        chatMessage.setTimestamp(deletedMessage.getTimestamp());
                    });
        }
        return chatMessage;
    }
}
