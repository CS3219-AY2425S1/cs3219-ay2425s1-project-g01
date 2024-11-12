const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 8083 });

const sessions = {};

function broadcast(sessionId, message) {
    const session = sessions[sessionId];
    if (session) {
        console.log(`Broadcasting to session ${sessionId}:`, message);
        session.clients.forEach(client => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
        });
    }
}

server.on('connection', (socket, request) => {
    console.log('New connection established');
    let sessionId;
    let userId;

    socket.on('message', (message) => {
        const data = JSON.parse(message);
        sessionId = data.sessionId;
        userId = data.userId;

        console.log(`Received message from user ${userId} in session ${sessionId}:`, data);

        // Create a new session if it doesn't exist
        if (!sessions[sessionId]) {
            sessions[sessionId] = { clients: [], acceptedUsers: new Set() };
            console.log(`Created new session: ${sessionId}`);
        }

        // Check if user is already in session
        const userExists = sessions[sessionId].clients.some(client => client.userId === userId);
        if (!userExists) {
            sessions[sessionId].clients.push({ ws: socket, userId });
            console.log(`User ${userId} added to session ${sessionId}. Total clients in session: ${sessions[sessionId].clients.length}`);
        } else {
            console.log(`User ${userId} is already connected in session ${sessionId}`);
        }

        // Handle the 'accept' and 'cancel' message types
        if (data.type === 'accept') {
            sessions[sessionId].acceptedUsers.add(userId);
            console.log(`User ${userId} accepted match in session ${sessionId}. Accepted users: ${Array.from(sessions[sessionId].acceptedUsers)}`);

            if (sessions[sessionId].acceptedUsers.size === 2) {
                console.log(`Both users accepted in session ${sessionId}. Starting collaboration...`);
                broadcast(sessionId, { type: 'bothAccepted', sessionId });
                delete sessions[sessionId];
                console.log(`Session ${sessionId} deleted after both users accepted.`);
            }
        } else if (data.type === 'cancel') {
            console.log(`User ${userId} canceled match in session ${sessionId}`);
            broadcast(sessionId, { type: 'userCanceled', sessionId, canceledBy: userId });
            delete sessions[sessionId];
            console.log(`Session ${sessionId} deleted after cancellation.`);
        }
    });

    socket.on('close', () => {
        if (sessions[sessionId]) {
            sessions[sessionId].clients = sessions[sessionId].clients.filter(client => client.ws !== socket);
            sessions[sessionId].acceptedUsers.delete(userId);
            console.log(`User ${userId} disconnected from session ${sessionId}. Remaining clients: ${sessions[sessionId].clients.length}`);
            if (sessions[sessionId].clients.length === 0) {
                delete sessions[sessionId];
                console.log(`Session ${sessionId} deleted as it has no more connected clients.`);
            }
        }
    });
});