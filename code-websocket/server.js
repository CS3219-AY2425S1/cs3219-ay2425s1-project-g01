const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 8081 });

// Store the code for each session ID
const sessionData = {};
const activeUsers = {};
const typingStatus = {}; // Store typing status for each session to track who is typing

server.on('connection', (socket, request) => {
    const urlParts = request.url.split('/');
    const sessionID = urlParts.pop().split('?')[0];
    const userID = new URLSearchParams(request.url.split('?')[1]).get('userID');
    const userName = new URLSearchParams(request.url.split('?')[1]).get('userName')

    console.log(`Full request URL: ${request.url}`);
    console.log(`Extracted userName: ${userName}, userID: ${userID}, sessionID: ${sessionID}`);

    if (!sessionID || !userID) {
        console.error(`Invalid connection attempt: sessionID or userID is missing`);
        socket.close();
        return;
    }

    // Initialize session data if it doesn't exist
    if (!sessionData[sessionID]) {
        sessionData[sessionID] = { code: '' };
    }

    if (!activeUsers[sessionID]) {
        activeUsers[sessionID] = {};
    }

    activeUsers[sessionID][userID] = socket;
    console.log(`User ${userID} connected to session ${sessionID}`);

    broadcastToSession(sessionID, {
        type: 'userConnected',
        userName,
    });

    // Send the current code to the newly connected client
    socket.send(JSON.stringify({ type: 'initialCode', content: sessionData[sessionID].code }));

    // Handle incoming messages
    socket.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        console.log(`Received message from user ${userID} in session ${sessionID}:`, parsedMessage);

        switch (parsedMessage.type) {
            case 'code':
                // Update the stored code for this session
                sessionData[sessionID].code = parsedMessage.content;

                // Broadcast the updated code to all clients in the same session
                broadcastToSession(sessionID, {
                    type: 'code',
                    content: parsedMessage.content
                }, socket);
                break;

            case 'typingStarted':
                // Broadcast typingStarted event to lock other users
                if (!typingStatus[sessionID]) {
                    typingStatus[sessionID] = userID;
                    broadcastToSession(sessionID, {
                        type: 'typingStarted',
                        userID,
                        userName
                    });
                    console.log(`User ${userName} started typing in session ${sessionID}`);
                }
                break;

            case 'typingEnded':
                // Broadcast typingEnded event to unlock editor for others
                if (typingStatus[sessionID] === userID) {
                    delete typingStatus[sessionID];
                    broadcastToSession(sessionID, {
                        type: 'typingEnded',
                        userID,
                        userName
                    });
                    console.log(`User ${userName} stopped typing in session ${sessionID}`);
                }
                break;

            default:
                console.warn('Unknown message type:', parsedMessage.type);
        }
    });

    // Handle client disconnection
    socket.on('close', (code, reason) => {
        console.log(`User ${userID} disconnected from session ${sessionID}, code: ${code}, reason: ${reason}`);

        // Remove the user from the active users list
        delete activeUsers[sessionID][userID];

        // Log the remaining users in the session
        const remainingUsers = Object.keys(activeUsers[sessionID]);
        console.log(`Remaining users in session ${sessionID}: ${remainingUsers.length > 0 ? remainingUsers.join(', ') : 'None'}`);

        broadcastToSession(sessionID, {
            type: 'userDisconnected',
            userID,
            userName
        });

        // Remove typing lock if the user was typing
        if (typingStatus[sessionID] === userID) {
            delete typingStatus[sessionID];
            broadcastToSession(sessionID, {
                type: 'typingEnded',
                userID,
                userName
            });
            console.log(`Typing lock released for session ${sessionID}`);
        }

        // Clean up session data if no users remain
        if (remainingUsers.length === 0) {
            console.log(`All users disconnected from session ${sessionID}. Removing session data.`);
            delete sessionData[sessionID];
            delete activeUsers[sessionID];
            delete typingStatus[sessionID];
        }
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket error for user ${userID} in session ${sessionID}:`, error);
    });
});

function broadcastToSession(sessionID, message, excludeSocket = null) {
    if (activeUsers[sessionID]) {
        Object.values(activeUsers[sessionID]).forEach((clientSocket) => {
            if (clientSocket.readyState === WebSocket.OPEN && clientSocket !== excludeSocket) {
                clientSocket.send(JSON.stringify(message));
            }
        });
    }
}

console.log(`WebSocket server is running on ws://localhost:${process.env.PORT || 8081}`);
