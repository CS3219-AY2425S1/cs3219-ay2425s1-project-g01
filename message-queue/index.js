const express = require('express')

const app = express()

const amqp = require('amqplib')

app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

const EXCHANGE = 'topics_exchange'

var connection, channel

const connectRabbitMQ = async() => {
  try {
    const amqpServer = 'amqps://lguugvwb:UtQY1D0zOoX8s0ZvR4GunuRDk0xv8UuI@octopus.rmq3.cloudamqp.com/lguugvwb'
    console.log(amqpServer)
    connection = await amqp.connect(amqpServer)
    channel = await connection.createChannel()
    await channel.assertExchange(EXCHANGE, 'topic', {durable: false})
    console.log('Connected to RabbitMQ')
  } catch(err) {
    console.error(err)
  }
}

connectRabbitMQ()

const addDataToExchange = async (userData, key) => {
  await channel.publish(EXCHANGE, key, Buffer.from(JSON.stringify(userData)))
}

app.post('/', (req, res) => {
  const {userData, key} = req.body //key will be <difficulty>.<topic(s)>
  addDataToExchange(userData, key)
  console.log('Data Sent: ', req.body)
  res.json({ message: 'Data Sent' })
 
})

app.get("/", (req, res, next) => {
  console.log('Hello World')
  res.json({
    message: "This is message queue."
  })
})

app.use((req, res, next) => {
  const error = new Error("Route Not Found")
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
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