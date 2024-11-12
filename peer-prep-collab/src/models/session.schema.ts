import mongoose from "mongoose"

const Schema = mongoose.Schema

const SessionSchema = new Schema({
  matchedUsers: {
    type: Object,
    required: true
  },
  matchedUserIds: {
    type: Object,
    required: true
  },
  question: {
    type: Object,
    required: true,
  },
  sessionId: {
    type: String,
    required: true
  },
  code : {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now // Setting default to the current date/time
  }
})

const SessionModel = mongoose.model("SessionModel", SessionSchema)

export default SessionModel