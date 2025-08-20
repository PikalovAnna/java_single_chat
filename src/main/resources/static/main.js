var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var usersArea = document.querySelector('#usersArea');
var connectingElement = document.querySelector('.connecting');
var appHeader = document.querySelector('#appHeader');
var currentUserEl = document.querySelector('#currentUser');
var logoutBtn = document.querySelector('#logoutBtn');
var userCountEl = document.querySelector('#userCount');

// Modal elements
var editModal = document.querySelector('#editModal');
var deleteModal = document.querySelector('#deleteModal');
var editMessageInput = document.querySelector('#editMessageInput');
var deleteMessagePreview = document.querySelector('#deleteMessagePreview');
var closeEditModal = document.querySelector('#closeEditModal');
var closeDeleteModal = document.querySelector('#closeDeleteModal');
var cancelEdit = document.querySelector('#cancelEdit');
var cancelDelete = document.querySelector('#cancelDelete');
var saveEdit = document.querySelector('#saveEdit');
var confirmDelete = document.querySelector('#confirmDelete');

var stompClient = null;
var username = null;
var currentEditingMessage = null;
var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();
    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        appHeader.classList.remove('hidden');
        currentUserEl.textContent = username;
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.reconnect_delay = 2000;
        stompClient.debug = null;
        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);
    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )
    connectingElement.classList.add('hidden');
}

function onError(error) {
    connectingElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = '#dc3545';
}

function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    
    if (message.messages && message.messages.length > 0 && message.messages[0].type === 'JOIN') {
        var curMessage = message.messages[0];
        message.messages.reverse();
        for (var i = 0; i < message.messages.length; i++) {
            var messageInLoop = message.messages[i];
            var messageElement1 = document.createElement('li');
            if (messageInLoop.type === 'JOIN') {
                messageElement1.classList.add('event-message');
                messageInLoop.content = messageInLoop.sender + ' joined!';
            } else if (messageInLoop.type === 'LEAVE'){
                messageElement1.classList.add('event-message');
                messageInLoop.content = messageInLoop.sender + ' left!';
            } else {
                messageElement1.classList.add('chat-message');
                if (messageInLoop.id) {
                    messageElement1.setAttribute('data-message-id', messageInLoop.id);
                }
                 var avatarElement = document.createElement('i');
                 var avatarText = document.createTextNode(messageInLoop.sender[0]);
                 avatarElement.appendChild(avatarText);
                 avatarElement.style['background-color'] = getAvatarColor(messageInLoop.sender);
                 messageElement1.appendChild(avatarElement);
                 var usernameElement = document.createElement('span');
                 var usernameText = document.createTextNode(messageInLoop.sender);
                 usernameElement.appendChild(usernameText);
                 messageElement1.appendChild(usernameElement);
                 
                 // Add message actions if it's the current user's message
                 if (messageInLoop.sender === username) {
                     addMessageActions(messageElement1, messageInLoop);
                 }
            }

            var textElement = document.createElement('p');
            var messageText = document.createTextNode(messageInLoop.content);
            textElement.appendChild(messageText);
            messageElement1.appendChild(textElement);
            messageArea.appendChild(messageElement1);
            messageArea.scrollTop = messageArea.scrollHeight;
        }
        updateUserOnline(message.users)
    } else if (message.type === 'LEAVE') {
        var messageElement = document.createElement('li');
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
        var userNode = document.getElementById(message.sender);
        if (userNode) { 
            userNode.remove(); 
            updateUserCount();
        }
        var textElement = document.createElement('p');
            var messageText = document.createTextNode(message.content);
            textElement.appendChild(messageText);
            messageElement.appendChild(textElement);
            messageArea.appendChild(messageElement);
            messageArea.scrollTop = messageArea.scrollHeight;
    } else if (message.type === 'EDIT') {
        // Handle edited message
        updateMessageInUI(message);
    } else if (message.type === 'DELETE') {
        // Handle deleted message
        removeMessageFromUI(message.id);
    } else {
        var messageElement = document.createElement('li');
        messageElement.classList.add('chat-message');
        if (message.id) {
            messageElement.setAttribute('data-message-id', message.id);
        }
        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);
        messageElement.appendChild(avatarElement);
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
        
        // Add message actions if it's the current user's message
        if (message.sender === username) {
            addMessageActions(messageElement, message);
        }

        var textElement = document.createElement('p');
            var messageText = document.createTextNode(message.content);
            textElement.appendChild(messageText);
            messageElement.appendChild(textElement);
            messageArea.appendChild(messageElement);
            messageArea.scrollTop = messageArea.scrollHeight;
    }
}

function addMessageActions(messageElement, messageData) {
    var actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';
    
    var editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-btn';
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    editBtn.title = 'Edit message';
    editBtn.onclick = function() {
        openEditModal(messageData);
    };
    
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.title = 'Delete message';
    deleteBtn.onclick = function() {
        openDeleteModal(messageData);
    };
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    messageElement.appendChild(actionsDiv);
}

function openEditModal(messageData) {
    currentEditingMessage = messageData;
    editMessageInput.value = messageData.content;
    editModal.classList.add('show');
    editMessageInput.focus();
    editMessageInput.select();
}

function openDeleteModal(messageData) {
    currentEditingMessage = messageData;
    deleteMessagePreview.textContent = messageData.content;
    deleteModal.classList.add('show');
}

function closeEditModalFunc() {
    editModal.classList.remove('show');
    currentEditingMessage = null;
    editMessageInput.value = '';
}

function closeDeleteModalFunc() {
    deleteModal.classList.remove('show');
    currentEditingMessage = null;
    deleteMessagePreview.textContent = '';
}

function saveEditMessage() {
    if (currentEditingMessage && editMessageInput.value.trim()) {
        var editMessage = {
            sender: username,
            content: editMessageInput.value.trim(),
            type: 'EDIT',
            originalMessageId: currentEditingMessage.id
        };
        stompClient.send("/app/chat.editMessage", {}, JSON.stringify(editMessage));
        closeEditModalFunc();
    }
}

function deleteMessage() {
    if (currentEditingMessage) {
        var deleteMessage = {
            sender: username,
            type: 'DELETE',
            originalMessageId: currentEditingMessage.id
        };
        stompClient.send("/app/chat.deleteMessage", {}, JSON.stringify(deleteMessage));
        closeDeleteModalFunc();
    }
}

function updateMessageInUI(message) {
    // Find and update the message in the UI
    var messageElements = messageArea.querySelectorAll('.chat-message');
    for (var i = 0; i < messageElements.length; i++) {
        var element = messageElements[i];
        var messageId = element.getAttribute('data-message-id');
        if (messageId == message.id) {
            var textElement = element.querySelector('p');
            if (textElement) {
                textElement.textContent = message.content;
                // Add edited indicator
                var editedIndicator = element.querySelector('.message-edited');
                if (!editedIndicator) {
                    editedIndicator = document.createElement('div');
                    editedIndicator.className = 'message-edited';
                    editedIndicator.textContent = '(edited)';
                    element.appendChild(editedIndicator);
                }
            }
            break;
        }
    }
}

function removeMessageFromUI(messageId) {
    // Find and remove the message from the UI
    var messageElements = messageArea.querySelectorAll('.chat-message');
    for (var i = 0; i < messageElements.length; i++) {
        var element = messageElements[i];
        var elementId = element.getAttribute('data-message-id');
        if (elementId == messageId) {
            element.remove();
            break;
        }
    }
}

function updateUserOnline(users){
    // Clear existing users
    usersArea.innerHTML = '';
    
    for (var i = 0; i < users.length; i++) {
        var userElement = document.createElement('li');
        userElement.classList.add('user-online');
        userElement.id = users[i];
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(users[i]);
        usernameElement.appendChild(usernameText);
        userElement.appendChild(usernameElement);
        usersArea.appendChild(userElement);
    }
    updateUserCount();
}

function updateUserCount() {
    var userCount = usersArea.children.length;
    userCountEl.textContent = userCount;
}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

// Add typing indicator
var typingTimer;
var doneTypingInterval = 1000;

messageInput.addEventListener('input', function() {
    clearTimeout(typingTimer);
    if (messageInput.value) {
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
});

function doneTyping() {
    // Could send typing indicator to server here
}

// Add enter key support for sending messages
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(e);
    }
});

// Modal event listeners
if (closeEditModal) {
    closeEditModal.addEventListener('click', closeEditModalFunc);
}
if (closeDeleteModal) {
    closeDeleteModal.addEventListener('click', closeDeleteModalFunc);
}
if (cancelEdit) {
    cancelEdit.addEventListener('click', closeEditModalFunc);
}
if (cancelDelete) {
    cancelDelete.addEventListener('click', closeDeleteModalFunc);
}
if (saveEdit) {
    saveEdit.addEventListener('click', saveEditMessage);
}
if (confirmDelete) {
    confirmDelete.addEventListener('click', deleteMessage);
}

// Close modals when clicking outside
editModal.addEventListener('click', function(e) {
    if (e.target === editModal) {
        closeEditModalFunc();
    }
});

deleteModal.addEventListener('click', function(e) {
    if (e.target === deleteModal) {
        closeDeleteModalFunc();
    }
});

// Enter key support for edit modal
editMessageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveEditMessage();
    }
});

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)

if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        try {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect(function() {
                    window.location.reload();
                });
            } else {
                window.location.reload();
            }
        } catch (e) {
            window.location.reload();
        }
    });
}