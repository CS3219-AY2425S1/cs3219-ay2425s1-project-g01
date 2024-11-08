import amqp, { Channel, Message } from "amqplib"
import { initiateCollaboration } from "./controllers/collaboration.controller"
import { Session } from "./models/session.model"

let channel: Channel
const COLLAB_QUEUE = 'collab_queue'
const ADD_SESSION_QUEUE = 'add_session_queue'

export const connectToRabbitMQ = async () => {
    try {
        const amqpServer = process.env.AMQP_SERVER || "amqps://lguugvwb:UtQY1D0zOoX8s0ZvR4GunuRDk0xv8UuI@octopus.rmq3.cloudamqp.com/lguugvwb";
        const connection = await amqp.connect(amqpServer)
        channel = await connection.createChannel()
        console.log("Connected to RabbitMQ")
    } catch (err) {
      console.log(err)
    }
}

const startConsume = async (onMessage: (message: Message) => void) => {
  try {
    await channel.assertQueue(COLLAB_QUEUE, {
      durable: false,
      messageTtl: 30000,
    })
    channel.consume(COLLAB_QUEUE, msg => {
      if (msg) {
        onMessage(JSON.parse(msg.content.toString()))
        channel.ack(msg)
      }
    })
  } catch (err) {
    console.log(err)
  }
}

export const updateUserService = (session: any) => {
  channel.assertQueue(ADD_SESSION_QUEUE,{durable: true})
  channel.sendToQueue(ADD_SESSION_QUEUE, Buffer.from(JSON.stringify(session)))
}

// To implement generation of session URL @LYNETTE @YUANTING -
async function onMessage(message: any) {
  
  console.log("Session id: ", message.sessionId) 

  const { matchedUsers, sessionId } = message;
  const { finalDifficulty, finalCategory } = processPreferences(matchedUsers);
  const username1 = matchedUsers[0].username;
  const username2 = matchedUsers[1].username;

  console.log("BEFORE CALLING INITIATE COLLABORATION - sessionId: ", sessionId);
  // creates collaboration service 
  await initiateCollaboration(sessionId, finalDifficulty, finalCategory, username1, username2);
}

function processPreferences(matchedUsers: any): { finalDifficulty: string, finalCategory: string } {

  const difficulty1 = matchedUsers[0].difficulty;
  const difficulty2 = matchedUsers[1].difficulty;

  // return medium difficulty if they are different
  const finalDifficulty = difficulty1 === difficulty2 ? difficulty1 : "medium";

  const category1 = matchedUsers[0].topic;
  const category2 = matchedUsers[1].topic;

  // return any category if they are different
  console.log("PROCESSING PREFERENCE - category1: ", category1);
  console.log("PROCESSING PREFERENCE - category2: ", category2);
  const finalCategory = category1 === category2 ? category1 : "";

  return { finalDifficulty, finalCategory };

}

export const initConsumer = () => startConsume(onMessage)