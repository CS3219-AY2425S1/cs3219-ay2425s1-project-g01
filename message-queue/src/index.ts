import amqp, { Channel, Connection, ConsumeMessage } from "amqplib"
import cors from "cors"
import dotenv from "dotenv"
import express, { Express, Request, Response } from "express"

import { DIFFICULTY_QUEUE_MAPPING, DIFFICULTY_ROUTING_KEYS, DIFFICULTY_ROUTING_MAPPING, EXCHANGE } from "./constants"
import { deepEqual, getRandomIntegerInclusive, sleep } from "./helper"
import { UserData } from "./types"

const app: Express = express()

dotenv.config()

app.use(express.json())
app.use(cors())

let users: UserData[] = []

let connection: Connection, channel: Channel

const connectRabbitMQ = async () => {
  try {
    const amqpServer = process.env.AMQP_SERVER
    console.log(amqpServer)
    connection = await amqp.connect(amqpServer)
    channel = await connection.createChannel()
    await channel.assertExchange(EXCHANGE, "topic", { durable: true })
    console.log("Connected to RabbitMQ")
  } catch (err) {
    console.error(err)
  }
}

connectRabbitMQ()

const handleIncomingNotification = (msg: string) => {
  try {
    const parsedMessage = JSON.parse(msg)

    // console.log(`Received Notification`, parsedMessage)
    users.push(parsedMessage)
    console.log(">>USERS: ", users)
    return parsedMessage
  } catch (error) {
    console.error(`Error while parsing the message`)
  }
}

// Decide again if needs to be asynchronous
const addDataToExchange = (userData: UserData, key: string) => {
  channel.publish(EXCHANGE, key, Buffer.from(JSON.stringify(userData)))
}

const pullDataFromExchange = async (queueName: string) => {
  let message: amqp.ConsumeMessage
  await channel.assertQueue(queueName, {
    durable: true
  })

  await channel.consume(queueName, (msg) => {
    if (!msg) {
      return console.error("Invalid incoming message")
    }
    message = msg
    try {
      handleIncomingNotification(msg?.content?.toString())
      channel.ack(msg)
    } catch (e) {
      console.log("Invalid message received")
      console.error(e)
      return {
        channel,
        message: ""
      }
    }
  })

  return {
    channel,
    message
  }
}

const matchUsers = async (userData: UserData, key: string) => {
    let matchedUsers: UserData[] = []

    let filteredUsers: UserData[] = users.filter((user: UserData) => {
      return user.user_id !== userData.user_id
    })

    matchedUsers.push(userData)

    // Case 3: Only 1 person in the queue
    let timeWaitedForMessage = 0
    let currentTotalUsersWaiting = users.length

    console.log(">>USER LENGTH: ", filteredUsers.length)

    if (filteredUsers.length == 0) {
      const waitForNewMessagesInterval = setInterval(async () => {
        timeWaitedForMessage += 2
        console.log(userData.user_id + ": Time waited for message Case 3: ", timeWaitedForMessage)
        if (timeWaitedForMessage == 30 || users.length != currentTotalUsersWaiting) {
          clearInterval(waitForNewMessagesInterval)
        }
      }, 2000)

      while (timeWaitedForMessage < 30 && users.length == currentTotalUsersWaiting) {
        await sleep(1000)
      }
      
      filteredUsers = users.filter((user: UserData) => {
        return user.user_id !== userData.user_id
      })

      // Means if new users have been added to the overall queue
      if (currentTotalUsersWaiting != filteredUsers.length) {
        for (const user of filteredUsers) {
          if (user.topic == userData.topic && user.user_id != userData.user_id) {
            matchedUsers.push(user)
            break
          }
        }

        // Possible that there isn't a perfect match
        // In that case jump to next if statement
        if (matchedUsers.length == 2) {
          return {
            matchedUsers,
            timeout: false
          }
        }
      }

      if (filteredUsers.length > 0) {
        console.log("Reach the default route")
        // Filter one more level (Obtain users that are of the requested difficulty, try)
        // To try and match on difficulty at least (tie-break)
        const filteredUsersForDesiredDifficulty = filteredUsers.filter((user: UserData) => {
          return DIFFICULTY_ROUTING_MAPPING[key] == user.difficulty
        })
        

        let nextUser: UserData
        if (filteredUsersForDesiredDifficulty.length > 0) {
          const randomlySelectedIndex = getRandomIntegerInclusive(0, filteredUsersForDesiredDifficulty.length - 1)
          nextUser = filteredUsersForDesiredDifficulty[randomlySelectedIndex]
          const userIdxOriginalArr = filteredUsers.findIndex((user) => deepEqual(nextUser, user))
          filteredUsers.splice(userIdxOriginalArr, 1)
        } else {
          const randomlySelectedIndex = getRandomIntegerInclusive(0, filteredUsers.length - 1)
          nextUser = filteredUsers.splice(randomlySelectedIndex, 1)[0]
        }

        // if (nextUser.user_id == userData.user_id) {
          // return {
          //   matchedUsers: [], // don't allow 2 same user to match
          //   timeout: true
          // }
        // }
        matchedUsers.push(nextUser)
        if (matchedUsers.length == 2) {
          return {
            matchedUsers,
            timeout: false
          }
        } else {
            return {
              matchedUsers: [], // don't allow 2 same user to match
              timeout: true
            }
        }
      } else {
        console.log("Reach the filtered route")
        // Try to pull data from other difficulty queues
        const filteredQueueNames = DIFFICULTY_ROUTING_KEYS.filter((routeKey) => {
          return routeKey != key
        })

        for (const queueName of filteredQueueNames) {
          await pullDataFromExchange(queueName as string)
        }

        filteredUsers = users.filter((user: UserData) => {
          return user.user_id !== userData.user_id
        })

        for (const user of filteredUsers) {
          console.log(user.topic + " " + userData.topic)
          console.log(user.user_id + " " + userData.user_id)
          if (user.topic == userData.topic && user.user_id != userData.user_id) {
            matchedUsers.push(user)
            break
          }
        }

        if (matchedUsers.length == 2) {
            return {
              matchedUsers,
              timeout: false
            }
        }

        // Timeout, cannot find match; assumes matchedUsers.length != 2
        return {
          matchedUsers: [],
          timeout: true
        }
      }
    }

    for (const user of filteredUsers) {
      console.log("Reached Case 1")
      // Case (1) - 2 people in queue have matching topic
      if (user.topic == userData.topic && user.user_id != userData.user_id) {
        matchedUsers.push(user)
        break
      }
    }

    if (matchedUsers.length == 2) {
      return {
        matchedUsers,
        timeout: false
      }
    }

    // Case (2) -> 1 person in queue, non matched topic so far
    timeWaitedForMessage = 0
    currentTotalUsersWaiting = users.length
    const waitForNewMessagesInterval = setInterval(async () => {
      timeWaitedForMessage += 2
      console.log("Time waited for message Case 2: ", timeWaitedForMessage)
      if (timeWaitedForMessage == 30 || users.length != currentTotalUsersWaiting) {
        clearInterval(waitForNewMessagesInterval)
      }
    }, 2000)

    while (timeWaitedForMessage < 30 && users.length == currentTotalUsersWaiting) {
      await sleep(1000)
    }

    filteredUsers = users.filter((user: UserData) => {
        return user.user_id !== userData.user_id
    })

    // Check currentTotalUsersWaiting with current user's length
    // If different, means new user added
    if (currentTotalUsersWaiting != filteredUsers.length) {
      for (const user of filteredUsers) {
        if (user.topic == userData.topic && user.user_id != userData.user_id) {
          matchedUsers.push(user)
          break
        }
      }

      // Possible that there isn't a perfect match
      // In that case jump to next if statement
      if (matchedUsers.length == 2) {
        return {
          matchedUsers,
          timeout: false
        }
      }
    }

    if (filteredUsers.length > 0) {
      // If still stuck with the same number of people
      // Randomly match amongst current users
      console.log("Randomly matched amongst current users case 3")

      // Filter one more level (Obtain users that are of the requested difficulty, try)
      // To try and match on difficulty at least (tie-break)
      const filteredUsersForDesiredDifficulty = filteredUsers.filter((user: UserData) => {
        return DIFFICULTY_ROUTING_MAPPING[key] == user.difficulty
      })

      let nextUser: UserData
      if (filteredUsersForDesiredDifficulty.length > 0) {
        const randomlySelectedIndex = getRandomIntegerInclusive(0, filteredUsersForDesiredDifficulty.length - 1)
        nextUser = filteredUsersForDesiredDifficulty[randomlySelectedIndex]
        const userIdxOriginalArr = filteredUsers.findIndex((user) => deepEqual(nextUser, user))
        filteredUsers.splice(userIdxOriginalArr, 1)
      } else {
        const randomlySelectedIndex = getRandomIntegerInclusive(0, filteredUsers.length - 1)
        nextUser = filteredUsers.splice(randomlySelectedIndex, 1)[0]
      }
      matchedUsers.push(nextUser)
      if (matchedUsers.length == 2) {
          return {
            matchedUsers,
            timeout: false
          }
      } else {
            return {
              matchedUsers: [], // don't allow 2 same user to match
              timeout: true
            }
      }
    } else {
      // Try to pull data from other difficulty queues
      console.log("Checking other queues")
      const filteredQueueNames = DIFFICULTY_ROUTING_KEYS.filter((routeKey) => {
        return routeKey != key
      })

      for (const queueName of filteredQueueNames) {
        await pullDataFromExchange(queueName as string)
      }

      for (const user of filteredUsers) {
        if (user.topic == userData.topic && user.user_id != userData.user_id) {
          matchedUsers.push(user)
          break
        }

        if (matchedUsers.length == 2) {
          return {
            matchedUsers,
            timeout: false
          } 
        }
      }

      // Timeout, cannot find match; assumes matchedUsers.length != 2
      return {
        matchedUsers: [],
        timeout: true
      }
    }
}



// Publish message to exchange
app.post("/match", async (req: Request, res: Response) => {
  try {
    const { userData, key } = req.body //key-value pair of userData will be <difficulty>.<topic(s)>
    addDataToExchange(userData, key)
    console.log("Data Sent: ", req.body)

    await pullDataFromExchange(DIFFICULTY_QUEUE_MAPPING[key])
    const response = await matchUsers(userData, key)
    //Remove the 2 matched users from backend
    if (response.matchedUsers.length == 2) {
      users = users.filter((user) => {
        return user.user_id != response.matchedUsers[0].user_id
      })
      users = users.filter((user) => {
        return user.user_id != response.matchedUsers[1].user_id
      })
    } else {
      //Remove user if no match found after 30s
      users = users.filter((user) => {
        return user.user_id != userData.user_id
      })
      //console.log("Length of users: " + users.length)
    }

    console.log("SUCCESSFUL MATCH: " + response.matchedUsers)
    console.log("TIMEOUT: " + response.timeout)

    // Timeout, cannot find match; assumes matchedUsers.length != 2
    res.json(response)

  } catch (e) {
    console.error("Message incorrectly sent out")
    console.error(e)
    res.json({ 
      matchedUsers: [],
      timeout: true
    })
  }
})

app.post("/match/delete", (req: Request, res: Response) => {
  users = users.filter((user) => {
    return user.user_id != req.body.user_id
  })

  res.json({
    "message": "User removed from the queue"
  })
})

app.use((req: Request, res: Response, next) => {
  const error: Error = new Error("Route Not Found")
  next(error)
})

app.use((error, req: Request, res: Response, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

app.listen(3002, () => {
  console.log("Publisher running.")
})
