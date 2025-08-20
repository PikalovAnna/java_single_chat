package org.pikalovanna.java_single_chat.service;

import lombok.RequiredArgsConstructor;
import org.pikalovanna.java_single_chat.dto.ChatMessageWrapper;
import org.pikalovanna.java_single_chat.entity.ChatMessage;
import org.pikalovanna.java_single_chat.repository.ChatMessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatMessagesService {

    private final ChatMessageRepository repository;

    /**
     * Возвращает постранично сообщения из чата
     *
     * @param page фильтр для пролистывания (номер страницы)
     * @param size фильтр для пролистывания (кол-во записей на странице)
     * @return страницу с сообщениями
     */
    public Page<ChatMessageWrapper> getPagedMessages(int page, int size) {
        return repository.findAll(
                PageRequest.of(
                        page,
                        size,
                        Sort.by("timestamp").descending()
                )
        ).map(ChatMessageWrapper::new);
    }

    public ChatMessage save(ChatMessageWrapper chatMessageWrapper) {
        ChatMessage chatMessage = new ChatMessage();
        String sender = chatMessageWrapper.getSender() == null ? null : chatMessageWrapper.getSender().trim();
        String content = chatMessageWrapper.getContent() == null ? null : chatMessageWrapper.getContent().trim();
        chatMessage.setSender(sender);
        chatMessage.setContent(content);
        chatMessage.setType(chatMessageWrapper.getType());
        return repository.save(chatMessage);
    }

    /**
     * Редактирует сообщение
     */
    public Optional<ChatMessage> editMessage(Long messageId, String sender, String newContent) {
        Optional<ChatMessage> messageOpt = repository.findByIdAndSender(messageId, sender);
        if (messageOpt.isPresent()) {
            ChatMessage message = messageOpt.get();
            if ("CHAT".equals(message.getType().name())) {
                message.setContent(newContent.trim());
                return Optional.of(repository.save(message));
            }
        }
        return Optional.empty();
    }

    /**
     * Удаляет сообщение
     */
    public Optional<ChatMessage> deleteMessage(Long messageId, String sender) {
        Optional<ChatMessage> messageOpt = repository.findByIdAndSender(messageId, sender);
        if (messageOpt.isPresent()) {
            ChatMessage message = messageOpt.get();
            if ("CHAT".equals(message.getType().name())) {
                repository.delete(message);
                return Optional.of(message);
            }
        }
        return Optional.empty();
    }

    /**
     * Проверяет, может ли пользователь редактировать/удалять сообщение
     */
    public boolean canUserModifyMessage(Long messageId, String sender) {
        return repository.findByIdAndSender(messageId, sender).isPresent();
    }
}
