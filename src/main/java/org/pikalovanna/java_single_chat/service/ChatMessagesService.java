package org.pikalovanna.java_single_chat.service;

import lombok.RequiredArgsConstructor;
import org.pikalovanna.java_single_chat.dto.ChatMessageWrapper;
import org.pikalovanna.java_single_chat.dto.Filter;
import org.pikalovanna.java_single_chat.entity.ChatMessage;
import org.pikalovanna.java_single_chat.repository.ChatMessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

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
    public Page<ChatMessageWrapper> getPagedMessages(int page, int size){
        return repository.findAll(
                PageRequest.of(
                        page,
                        size,
                        Sort.by("id").descending()
                )
        ).map(ChatMessageWrapper::new);
    }

    public ChatMessage save(ChatMessageWrapper chatMessageWrapper){
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSender(chatMessageWrapper.getSender());
        chatMessage.setContent(chatMessageWrapper.getContent());
        chatMessage.setType(chatMessageWrapper.getType());
        return repository.save(chatMessage);
    }
}
