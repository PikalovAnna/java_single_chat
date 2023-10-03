package org.pikalovanna.java_single_chat.service;

import lombok.RequiredArgsConstructor;
import org.apache.http.util.Asserts;
import org.pikalovanna.java_single_chat.entity.User;
import org.pikalovanna.java_single_chat.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Создает пользователя
     *
     * @param login - Логин пользователя
     */
    public void createUser(String login) {
        User user = new User();
        user.setLogin(login);
        userRepository.save(user);
    }

    /**
     * Возвращает пользователя
     *
     * @param id - Уникальный идентификатор пользователя
     */
    public User getUser(Long id){
        User user = userRepository.getOne(id);
        Asserts.notNull(user,"Пользователь не найден");
        return user;
    }

    /**
     * Возвращает пользователя
     *
     * @param login - Логин пользователя
     */
    public User getUserByLogin(String login){
        User user = userRepository.findByLogin(login);
        Asserts.notNull(user,"Пользователь не найден");
        return user;
    }

}
