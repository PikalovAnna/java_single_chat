package org.pikalovanna.java_single_chat.service;

import lombok.RequiredArgsConstructor;
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
     * @param filter фильтр для пролистывания (номер страницы, кол-во записей на странице)
     * @return страницу с сообщениями
     */
    public Page<ChatMessage> getPagedMessages(Filter filter){
        return repository.findAll(
                PageRequest.of(
                        filter.getPage(),
                        filter.getSize(),
                        Sort.by("id").descending()
                )
        );
    }

}
