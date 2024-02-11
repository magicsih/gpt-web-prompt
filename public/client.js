const messageInput = document.getElementById('messageInput');
const chatBox = document.getElementById('chatBox');
const sendButton = document.getElementById('send');

// const ws = new WebSocket('ws://localhost:8080');
const protocol = (window.location.protocol === "https:") ? "wss://" : "ws://";
const ws = new WebSocket(`${protocol}${window.location.hostname}`);

function createMessageElement(role) {
    console.log('createMessageElement:', role)
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);
    chatBox.appendChild(messageDiv);
    return messageDiv;
}

// 글자를 메시지 div에 추가하는 함수
function appendCharacterToMessageElement(messageDiv, char) {
    messageDiv.textContent += char;
    chatBox.scrollTop = chatBox.scrollHeight; // 스크롤을 최신 메시지로 이동
}

let currentMessageDiv;

ws.onopen = () => {
    console.log('Connected to the server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const fin = data.fin;
    if (!fin) {
        // textArea messageInput을 disable 시킴
        messageInput.disabled = true;
    }
    const role = data.role;
    const content = data.content;

    // 서버로부터 새로운 글자를 받을 때마다 화면에 출력
    // 여기에서는 메시지의 시작과 끝을 구분하지 않고, 모든 글자를 즉시 화면에 표시합니다.
    if (!currentMessageDiv) {
        currentMessageDiv = createMessageElement(role);
    }
    appendCharacterToMessageElement(currentMessageDiv, content);

    if (fin) {
        currentMessageDiv.innerHTML = marked.parse(currentMessageDiv.textContent);
        // 메시지의 끝을 나타내는 글자를 받으면, 현재 메시지 div를 null로 설정하여 다음 메시지를 받을 준비
        currentMessageDiv = null;
        // 서버로부터 메시지를 받을 때마다 스크롤을 최신 메시지로 이동
        chatBox.scrollTop = chatBox.scrollHeight;
        // message Input에 포커스를 맞추고 enable 시킴
        messageInput.focus();
        messageInput.disabled = false;
    }
};

sendButton.onclick = () => {
    const message = messageInput.value.trim();
    if (message) {
        const userMessageDiv = createMessageElement('user');
        appendCharacterToMessageElement(userMessageDiv, message);
        ws.send(message);
        messageInput.value = ''; // 입력 필드 비우기
    }
};

messageInput.focus();