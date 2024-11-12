import amqp, { Channel, Connection } from "amqplib"
import cors from "cors"
import dotenv from "dotenv"
import express, { Express, Request, Response } from "express"
import { ChangeStream } from "mongodb"

import { COLLAB_EXCHANGE, COLLAB_KEY, EXCHANGE } from "./constants"
import { connectToMongoDB, db } from "./db"
import { generateSessionId } from "./helper"
import { CollabExchangeData, UserData } from "./types"

const app: Express = express()

dotenv.config()

app.use(express.json())
app.use(cors())

let connection: Connection, channel: Channel
const amqpServer = process.env.AMQP_SERVER

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(amqpServer)
    channel = await connection.createChannel()
    await channel.assertExchange(EXCHANGE, "topic", { durable: true })
    await channel.assertExchange(COLLAB_EXCHANGE, "direct", { durable: true })
    console.log("Connected to RabbitMQ")
  } catch (err) {
    console.error(err)
  }
}

connectRabbitMQ()
connectToMongoDB()

const addDataToCollabExchange = (data: CollabExchangeData, key: string) => {
  channel.publish(COLLAB_EXCHANGE, key, Buffer.from(JSON.stringify(data)))
}

let waitingUsers: { [key: string]: (data: any) => void } = {}

const matchUsers = async (userData: any, key: string): Promise<{ matchedUsers: any[] }> => {
  let changeStream: ChangeStream = null
  try {
    // Check for a matching user in the queue based on difficulty and topic
    const matchQuery = {
      difficulty: userData.difficulty,
      topic: userData.topic,
      user_id: { $ne: userData.user_id } // Exclude the current user
    }

    // Match on both difficulty and topic first
    let matchedUser = await db.collection("usersQueue").findOne(matchQuery)

    if (!matchedUser) {
      console.log("Step 1.1: No exact match found, checking for difficulty only")
      const difficultyOnlyQuery = {
        difficulty: userData.difficulty,
        user_id: { $ne: userData.user_id } // Exclude the current user
      }
      matchedUser = await db.collection("usersQueue").findOne(difficultyOnlyQuery)
    }

    if (!matchedUser) {
      console.log("Step 1: No exact match found, checking for topic only")
      const topicOnlyQuery = {
        topic: userData.topic,
        user_id: { $ne: userData.user_id } // Exclude the current user
      }
      matchedUser = await db.collection("usersQueue").findOne(topicOnlyQuery)
    }

    if (matchedUser) {
      console.log("Step 2: Match found, notifying both users")
      await db.collection("usersQueue").deleteOne({ user_id: matchedUser.user_id })
      await db.collection("usersQueue").deleteOne({ user_id: userData.user_id })

      const matchedResponse = {
        matchedUsers: [userData, matchedUser]
      }

      if (waitingUsers[userData.user_id]) {
        waitingUsers[userData.user_id](matchedResponse)
        delete waitingUsers[userData.user_id]
      }
      if (waitingUsers[matchedUser.user_id]) {
        waitingUsers[matchedUser.user_id](matchedResponse)
        delete waitingUsers[matchedUser.user_id]
      }

      return matchedResponse
    }

    const existingUser = await db.collection("usersQueue").findOne({ user_id: userData.user_id })
    if (!existingUser) {
      console.log("Step 3: No existing entry, adding user to queue")
      await db.collection("usersQueue").insertOne(userData)
    } else {
      console.log("Step 3: User already exists in the queue, skipping insert")
      return { matchedUsers: [] }
    }

    // **Create Change Stream and Handle Event**
    return new Promise((resolve) => {
      waitingUsers[userData.user_id] = resolve

      const timer = setInterval(async () => {
        console.log("Step 4: Timeout reached, removing user from queue")
        await db.collection("usersQueue").deleteOne({ user_id: userData.user_id })
        resolve({ matchedUsers: [] })
        delete waitingUsers[userData.user_id]

        // Close change stream on timeout
        if (changeStream) {
          try {
            console.log("Closing change stream on timeout")
            changeStream.close()
          } catch (e) {
            console.error(e)
            return { matchedUsers: [] }
          }
        }
      }, 30000)

      // **Create the change stream and manage lifecycle**
      changeStream = db.collection("usersQueue").watch()
      changeStream.on("change", async (change) => {
        console.log("Step 5: Change detected", change.operationType)

        if (change.operationType === "insert") {
          const newUser = change.fullDocument

          if (
            newUser.difficulty === userData.difficulty &&
            newUser.topic === userData.topic &&
            newUser.user_id !== userData.user_id // Avoid matching with oneself
          ) {
            console.log("Step 5.1: Match found through change stream")
            clearInterval(timer)
            await db.collection("usersQueue").deleteOne({ user_id: newUser.user_id })
            await db.collection("usersQueue").deleteOne({ user_id: userData.user_id })

            const matchedResponse = {
              matchedUsers: [userData, newUser]
            }

            if (waitingUsers[userData.user_id]) {
              waitingUsers[userData.user_id](matchedResponse)
              delete waitingUsers[userData.user_id]
            }
            if (waitingUsers[newUser.user_id]) {
              waitingUsers[newUser.user_id](matchedResponse)
              delete waitingUsers[newUser.user_id]
            }

            // **Close the change stream once a match is found**
            if (changeStream) {
              console.log("Closing change stream after match")
              changeStream.close()
            }
          }
        } else {
          clearInterval(timer)
          // **Close the change stream once a match is found**
          if (changeStream) {
            console.log("Closing change stream after delete event")
            changeStream.close()
          }
        }
      })
    })
  } catch (error) {
    console.error("Error in matchUsers:", error)

    // **Ensure the change stream is closed on error**
    if (changeStream) {
      console.log("Closing change stream on error")
      changeStream.close()
    }

    return { matchedUsers: [] }
  }
}

app.post("/match", async (req: Request, res: Response) => {
  const { userData, key } = req.body

  try {
    console.log("Data Sent: ", req.body)

    const MAX_WAIT_TIME = 30000
    let matchFound = false
    let response = { matchedUsers: [] }

    const waitForMatch = async () => {
      const startTime = Date.now()
      while (Date.now() - startTime < MAX_WAIT_TIME && !matchFound) {
        response = (await matchUsers(userData, key)) as { matchedUsers: UserData[] }
        if (response.matchedUsers.length === 2) {
          matchFound = true
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    await waitForMatch()

    if (response.matchedUsers.length === 2) {
      const matchedUserIds = response.matchedUsers.map((user) => user.user_id)
      await db.collection("usersQueue").deleteMany({ user_id: { $in: matchedUserIds } })

      delete waitingUsers[response.matchedUsers[0].user_id]
      delete waitingUsers[response.matchedUsers[1].user_id]
      const sessionId = generateSessionId(response.matchedUsers[0], response.matchedUsers[1])
      const dataToExchange: CollabExchangeData = {
        matchedUsers: response.matchedUsers,
        sessionId: sessionId
      }
      if (userData === response.matchedUsers[0]) {
        // First user in response.matchedUser to push to Collab exchange
        addDataToCollabExchange(dataToExchange, COLLAB_KEY) //Send to exchange
      }
      res.json({
        matchedUsers: response.matchedUsers,
        sessionId: sessionId,
        timeout: false
      })
    } else {
      await db.collection("usersQueue").deleteOne({ user_id: userData.user_id })
      res.json({
        matchedUsers: [],
        timeout: true
      })
    }
  } catch (error) {
    console.error("Error while matching:", error)
    res.status(500).json({
      matchedUsers: [],
      timeout: true
    })
  }
})

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Matching service running on port ${port}.`);
});
