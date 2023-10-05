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
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        chatMessagesService.save(chatMessage);
        userService.addUser(chatMessage.getSender());
        Map<String, Object> content = new HashMap<>();
        content.put("users", userService.getUsersOnline());
        content.put("messages", chatMessagesService.getPagedMessages(0, 10).getContent());
        return content;
    }
}
