import UserModel from "./user-model.js"

import "dotenv/config"

import { connect } from "mongoose"

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI

  await connect(mongoDBUri)
}

export async function createUser(username, email, password) {
  return new UserModel({ username, email, password }).save()
}

export async function findUserByEmail(email) {
  return UserModel.findOne({ email })
}

export async function findUserById(userId) {
  return UserModel.findById(userId)
}

export async function findUserByUsername(username) {
  return UserModel.findOne({ username })
}

export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [{ username }, { email }]
  })
}

export async function findAllUsers() {
  return UserModel.find()
}

export async function updateUserById(userId, username, email, password) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        password
      }
    },
    { new: true } // return the updated user
  )
}

export async function updateUsers(sessionIdentifier, user1, user2, question) {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var time = String(today.getHours()).padStart(2, '0') + ":" + String(today.getMinutes()).padStart(2, '0');
  var yyyy = today.getFullYear();
  var dateTime = dd + '/' + mm + '/' + yyyy + " at " + time + " HOURS";
  await UserModel.updateMany(
    {username: user1},
    { $push: 
        {matches: {IdInSessionDB: sessionIdentifier ,dateTime,...{matchedUser: user2},...question}}
    }
  )

  await UserModel.updateMany(
    {username: user2},
    { $push: 
         {matches: {IdInSessionDB: sessionIdentifier ,dateTime,...{matchedUser: user1},...question}}
    }
  )
}

export async function updateUserPrivilegeById(userId, isAdmin) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin
      }
    },
    { new: true } // return the updated user
  )
}

export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId)
}
