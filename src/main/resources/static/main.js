var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var usersArea = document.querySelector('#usersArea');
var connectingElement = document.querySelector('.connecting');
var stompClient = null;
var username = null;
var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];
function connect(event) {
    username = document.querySelector('#name').value.trim();
    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
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
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}
function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}
function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    if (message instanceof Array && message[0].type === 'JOIN') {
        var curMessage = message[0];
        message.reverse();
        for (var i = 0; i < message.length; i++) {
            var messageInLoop = message[i];
            var messageElement1 = document.createElement('li');
            if (messageInLoop.type === 'JOIN') {
                messageElement1.classList.add('event-message');
                messageInLoop.content = messageInLoop.sender + ' joined!';
            } else if (messageInLoop.type === 'LEAVE'){
                messageElement1.classList.add('event-message');
                messageInLoop.content = messageInLoop.sender + ' left!';
            } else {
                messageElement1.classList.add('chat-message');
                 var avatarElement = document.createElement('i');
                 var avatarText = document.createTextNode(messageInLoop.sender[0]);
                 avatarElement.appendChild(avatarText);
                 avatarElement.style['background-color'] = getAvatarColor(messageInLoop.sender);
                 messageElement1.appendChild(avatarElement);
                 var usernameElement = document.createElement('span');
                 var usernameText = document.createTextNode(messageInLoop.sender);
                 usernameElement.appendChild(usernameText);
                 messageElement1.appendChild(usernameElement);
            }
            var textElement = document.createElement('p');
            var messageText = document.createTextNode(messageInLoop.content);
            textElement.appendChild(messageText);
            messageElement1.appendChild(textElement);
            messageArea.appendChild(messageElement1);
            messageArea.scrollTop = messageArea.scrollHeight;
        }

        var userElement = document.createElement('li');
        userElement.classList.add('user-online');
        userElement.id = curMessage.sender;
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(curMessage.sender);
        usernameElement.appendChild(usernameText);
        userElement.appendChild(usernameElement);
        usersArea.appendChild(userElement);
        usersArea.scrollTop = usersArea.scrollHeight;
    } else if (message.type === 'LEAVE') {
        var messageElement = document.createElement('li');
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';

        document.getElementById(message.sender).remove()

        var textElement = document.createElement('p');
            var messageText = document.createTextNode(message.content);
            textElement.appendChild(messageText);
            messageElement.appendChild(textElement);
            messageArea.appendChild(messageElement);
            messageArea.scrollTop = messageArea.scrollHeight;
    } else {
        var messageElement = document.createElement('li');
        messageElement.classList.add('chat-message');
        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);
        messageElement.appendChild(avatarElement);
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);

        var textElement = document.createElement('p');
            var messageText = document.createTextNode(message.content);
            textElement.appendChild(messageText);
            messageElement.appendChild(textElement);
            messageArea.appendChild(messageElement);
            messageArea.scrollTop = messageArea.scrollHeight;
    }
}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)