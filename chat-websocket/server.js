const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 8082 });

// Store the chat messages for each session ID
const sessionData = {};
const activeUsers = {};

server.on('connection', (socket, request) => {
    const urlParts = request.url.split('/');
    const sessionID = urlParts.pop().split('?')[0];
    const userID = new URLSearchParams(request.url.split('?')[1]).get('userID');

    // Initialize session data if it doesn't exist
    if (!sessionData[sessionID]) {
        sessionData[sessionID] = { messages: [] };
    }

    if (!activeUsers[sessionID]) {
        activeUsers[sessionID] = {};
    }
s
    activeUsers[sessionID][userID] = socket;

    // Broadcast to other users that a new user has connected
    broadcastToSession(sessionID, {
        type: 'userConnected',
        userID,
    });

    // Send the current chat history to the newly connected client
    socket.send(JSON.stringify({
        type: 'initialMessages',
        content: sessionData[sessionID].messages
    }));

    // Handle incoming chat messages
    socket.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'chat') {
            // Re-initialize session data if it was removed
            if (!sessionData[sessionID]) {
                sessionData[sessionID] = { messages: [] };
            }

            // Store the chat message for the session
            const chatMessage = {
                userID: parsedMessage.userID,
                content: parsedMessage.content,
            };
            sessionData[sessionID].messages.push(chatMessage);

            // Broadcast the chat message to all clients in the same session
            broadcastToSession(sessionID, {
                type: 'chat',
                userID: parsedMessage.userID,
                content: parsedMessage.content,
            }, socket);
        }
    });

    // Handle client disconnection
    socket.on('close', () => {
        delete activeUsers[sessionID][userID];

        const remainingUsers = Object.keys(activeUsers[sessionID]);
        
        // Broadcast to other users that a user has disconnected
        broadcastToSession(sessionID, {
            type: 'userDisconnected',
            userID,
        });

        // If no users remain, clean up session data
        if (remainingUsers.length === 0) {
            delete sessionData[sessionID];
            delete activeUsers[sessionID];
        }
    });

    // Handle socket errors
    socket.on('error', (error) => {
        console.error(`Socket error for user ${userID} in session ${sessionID}:`, error);
    });
});

function broadcastToSession(sessionID, message, excludeSocket = null) {
    Object.values(activeUsers[sessionID]).forEach((clientSocket) => {
        if (clientSocket.readyState === WebSocket.OPEN && clientSocket !== excludeSocket) {
            clientSocket.send(JSON.stringify(message));
        }
    });
}

console.log('Chat WebSocket server is running on ws://localhost:8082');
