import express from 'express';
import dotenv from 'dotenv';
import collabRoutes from './routes/collaboration.routes';
import { connectToRabbitMQ, initConsumer } from '.';

dotenv.config();

const app = express();
app.use(express.json());

// tells the server to use collabRoutes for any requests starting with '/collab'
app.use('/collab', collabRoutes);

// process.env = built-in object in Node.js that contains all the environment variables 
// process.env.PORT allows us to change the port the server runs on without modifying code (for diff environments)

connectToRabbitMQ()
    .then(() => {
        initConsumer() //Start consuming
    })
    .then(() => {
        const PORT = process.env.PORT || 4003;
        app.listen(PORT, () => {
            console.log(`Collaboration service is running on port ${PORT}`);
        })
    })
    .catch((err) => {
        throw new Error(err) // Throw back error if caught,
    })

