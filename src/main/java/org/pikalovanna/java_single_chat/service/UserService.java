package org.pikalovanna.java_single_chat.service;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {

    public final Set<String> usersOnline = new HashSet<>();

    public void addUser(String login) {
        usersOnline.add(login);
    }

    public void delUser(String login) {
        usersOnline.remove(login);
    }

    public Set<String> getUsersOnline() {
        return usersOnline;
    }
}
