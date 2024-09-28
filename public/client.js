const messageInput = document.getElementById('messageInput');
const chatBox = document.getElementById('chatBox');
const sendButton = document.getElementById('send');
const quill = new Quill('#messageInput', {
    theme: 'snow',
    modules: {
        toolbar: false,
        keyboard: {
            bindings: {
                tab: {
                    key: 9,
                    handler: function (range, context) {
                        const nextInput = document.querySelector('#messageInput .ql-editor');
                        nextInput.focus();
                        return true;
                    }
                }
            }
        }
    },
    placeholder: 'Waiting for the server...',
});
quill.enable(false);

const protocol = (window.location.protocol === "https:") ? "wss://" : "ws://";
const ws = new WebSocket(`${protocol}${window.location.hostname}`);

function createMessageElement(role) {
    console.log('createMessageElement:', role)
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);
    chatBox.appendChild(messageDiv);
    return messageDiv;
}

// Function to append characters to the message div
function appendCharacterToMessageElement(messageDiv, char) {
    messageDiv.textContent += char;
    chatBox.scrollTop = chatBox.scrollHeight; // 스크롤을 최신 메시지로 이동
}

let currentMessageDiv;

ws.onopen = () => {
    console.debug('Connected to the server');
    quill.root.dataset.placeholder = 'Type here...';
    quill.enable(true);
};

ws.onmessage = (event) => {
    console.log('Message received:', event.data);
    try {
        const data = JSON.parse(event.data);
        const fin = data.fin;
        const role = data.role;
        const content = data.content;

        // Display each character received from the server immediately
        // The code here doesn't distinguish the beginning and end of the message, 
        // and displays every character instantly.
        if (!currentMessageDiv) {
            currentMessageDiv = createMessageElement(role);
        }

        appendCharacterToMessageElement(currentMessageDiv, content);

        if (fin) {
            currentMessageDiv.innerHTML = marked.parse(currentMessageDiv.textContent);

            // Once the end of the message is received, set the current message div to null 
            // to prepare for the next message
            currentMessageDiv = null;
            
            // Re-enable the input and focus on the message input
            document.querySelector('button#send').disabled = false;
            quill.root.dataset.placeholder = 'Type here...';
            quill.enable(true);
            quill.focus();
        } else {
            quill.root.dataset.placeholder = 'AI is typing...';
        }

        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (e) {
        console.error(e);
        currentMessageDiv = createMessageElement('error');
        appendCharacterToMessageElement(currentMessageDiv, e.message);
        document.querySelector('button#send').disabled = false;
        quill.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
};

sendButton.onclick = () => {
    document.querySelector('button#send').disabled = true;
    const message = quill.getText();

    if (message && message.length > 0) {
        const userMessageDiv = createMessageElement('user');
        appendCharacterToMessageElement(userMessageDiv, message);
        ws.send(message);
        quill.setText('');
        quill.root.dataset.placeholder = 'Waiting for AI...';
        quill.enable(false);
    }
};

quill.focus();